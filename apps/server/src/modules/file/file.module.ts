import { Module, Provider } from '@nestjs/common'

import { FileController } from './file.controller'
import { FileService } from './file.service'

const providers: Provider[] = [FileService]

@Module({
  controllers: [FileController],
  providers,
  exports: providers,
})
export class FileModule { }
