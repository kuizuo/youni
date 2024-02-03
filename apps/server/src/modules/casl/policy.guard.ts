import { subject } from '@casl/ability'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { FastifyRequest } from 'fastify'

import { AbilityService } from './casl.service'
import { CHECK_POLICY_KEY, PolicyObject } from './policy.decortor'

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityService: AbilityService,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()

    const { user } = context.switchToHttp().getRequest()

    const policy = this.reflector.getAllAndOverride<PolicyObject>(CHECK_POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // 使用了 PolicyGuard 但没未其定义 policy 则不允许通过
    if (!policy)
      return false

    const { action, model } = policy

    const ability = this.abilityService.abilityMap[model].createForUser(user)

    // 获取请求资源的的 id
    const id = this.getRequestItemId(request)

    if (id) {
      const item = await this.prisma[model].findUniqueOrThrow({
        where: { id },
      })

      return ability.can(action, subject(model, item))
    }

    return ability.can(action, model)
  }

  private getRequestItemId = (request?: FastifyRequest): string => {
    const { params = {}, body = {}, query = {} } = (request ?? {}) as any
    const id = params.id ?? body.id ?? query.id

    return id
  }
}
