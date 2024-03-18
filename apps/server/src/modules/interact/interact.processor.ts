import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'

import { INTERACT_QUEUE, InteractType, QueueProcess } from './interact.constant'
import { CountingService } from './services/counting.service'
import { LikeService } from './services/like.service'

export interface JobData {
  itemType: InteractType
  itemId: string

  refType: InteractType
  refId: string
}

@Processor(INTERACT_QUEUE)
export class InteractProcessor {
  private readonly logger = new Logger(InteractProcessor.name)

  constructor(
    private readonly likeService: LikeService,
    private readonly countingService: CountingService,
  ) { }

  @Process({ name: QueueProcess.UpdateItemCount })
  async handleUpdateItemCount(job: Job<JobData>) {
    const { itemType, itemId } = job.data

    const likeCountPromise = this.likeService.getItemlikedCount(itemType, itemId)
    const collectedCountPromise = this.countingService.getItemCollectCount(itemId)
    const commentCountPromise = this.countingService.getCommentCount(itemType, itemId)

    const [likeCount, collectedCount, commentCount] = await Promise.all([
      likeCountPromise,
      collectedCountPromise,
      commentCountPromise,
    ])

    await Promise.all([
      this.countingService.updateCount(itemType, itemId, 'liked', likeCount),
      this.countingService.updateCount(itemType, itemId, 'collect', collectedCount),
      this.countingService.updateCount(itemType, itemId, 'comment', commentCount),
    ])
  }

  @Process({ name: QueueProcess.UpdateCommentCount })
  async handleUpdateCommentCount(job: Job<JobData>) {
    const { itemType, itemId, refType, refId } = job.data

    const likeCountPromise = this.likeService.getItemlikedCount(itemType, itemId)
    const commentCountPromise = this.countingService.getCommentCount(refType, refId, itemId)

    const [likeCount, commentCount] = await Promise.all([
      likeCountPromise,
      commentCountPromise,
    ])

    await Promise.all([
      this.countingService.updateCount(itemType, itemId, 'liked', likeCount),
      this.countingService.updateCount(itemType, itemId, 'comment', commentCount),
    ])
  }
}
