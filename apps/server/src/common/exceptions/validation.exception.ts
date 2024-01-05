import { UnprocessableEntityException, ValidationError } from '@nestjs/common'

export class ValidationException extends UnprocessableEntityException {
  constructor(errors: ValidationError[]) {
    super(
      errors.map((e) => {
        const rule = Object.keys(e.constraints!)[0]
        const msg = e.constraints![rule]
        return msg
      })[0],
    )
  }
}
