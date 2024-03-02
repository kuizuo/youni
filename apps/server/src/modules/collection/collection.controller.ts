import {
  Controller,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CollectionService } from './collection.service'

@ApiTags('Business - 收藏模块')
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) { }

  // see collection.trpc.ts
}
