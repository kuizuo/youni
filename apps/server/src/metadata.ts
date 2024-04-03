/* eslint-disable */
export default async () => {
    const t = {
        ["./modules/auth/auth.model"]: await import("./modules/auth/auth.model")
    };
    return { "@nestjs/swagger": { "models": [[import("./modules/auth/auth.dto"), { "LoginDto": {}, "RegisterDto": {} }], [import("./common/dto/id.dto"), { "IdDto": {} }], [import("./common/dto/pager.dto"), { "PagerDto": {} }], [import("./modules/user/dto/password.dto"), { "PasswordUpdateDto": {}, "UserPasswordDto": {} }], [import("./modules/user/dto/user.dto"), { "UserDto": {}, "UserUpdateDto": {}, "UserQueryDto": {} }], [import("./modules/auth/dtos/account.dto"), { "UpdateProfileDto": {}, "ResetPasswordDto": {} }], [import("./common/dto/image.dto"), { "ImagesDto": {} }], [import("./modules/campus/campus.dto"), { "CampusDto": {}, "CampusUpdateDto": {}, "CampusPagerDto": {}, "CampusSearchDto": {} }], [import("./modules/collection/collection.dto"), { "CollectionDto": {}, "CollectionUpdateDto": {}, "CollectionPagerDto": {}, "CollectionItemQueryDto": {}, "CollectionItemDto": {} }], [import("./modules/comment/comment.dto"), { "CreateCommentDto": {}, "CommentPagerDto": {}, "SubCommentPagerDto": {} }], [import("./common/dto/delete.dto"), { "BatchDeleteDto": {} }], [import("./modules/note/note.dto"), { "NoteDto": {}, "NoteUpdateDto": {}, "NotePagerDto": {}, "UserNotePagerDto": {}, "NoteSearchDto": {}, "NoteByTagDto": {}, "NoteByCampusDto": {} }], [import("./modules/history/history.dto"), { "HistoryPagerDto": {} }], [import("./modules/interact/interact.dto"), { "InteractPagerDto": {} }], [import("./modules/note-tag/note-tag.dto"), { "NoteTagDto": {}, "NoteTagUpdateDto": {}, "NoteTagPagerDto": {} }], [import("./modules/notification/notification.dto"), { "CreateNotificationDto": {}, "NotificationPagerDto": {} }], [import("./modules/todo/todo.dto"), { "TodoDto": {}, "TodoUpdateDto": {}, "TodoPagerDto": {} }], [import("./modules/auth/captcha/captcha.dto"), { "ImageCaptchaDto": {}, "SendEmailCodeDto": {}, "SendSmsCodeDto": {}, "CheckCodeDto": {} }], [import("./modules/file/file.dto"), { "FileQueryDto": {}, "FileUploadDto": {} }], [import("./modules/user/dto/search.dto"), { "UserSearchDto": {} }]], "controllers": [[import("./modules/user/user.controller"), { "UserController": { "list": {}, "getUserById": {}, "create": {}, "update": {}, "delete": {}, "password": {} } }], [import("./modules/auth/auth.controller"), { "AuthController": { "login": {}, "register": {} } }], [import("./modules/auth/captcha/captcha.controller"), { "CaptchaController": { "captchaByImg": { type: t["./modules/auth/auth.model"].ImageCaptcha } } }], [import("./modules/auth/controllers/account.controller"), { "AccountController": { "profile": {}, "updateProfile": {}, "logout": {}, "password": {} } }], [import("./modules/auth/controllers/email.controller"), { "EmailController": { "sendEmailCode": {} } }], [import("./modules/auth/controllers/google.controller"), { "GoogleController": { "googleAuth": {}, "googleAuthRedirect": {} } }], [import("./modules/comment/comment.controller"), { "CommentController": { "page": {}, "list": {}, "create": {}, "like": { type: Boolean }, "delete": {} } }], [import("./modules/file/file.controller"), { "FileController": { "getTypes": {}, "get": {}, "upload": {}, "uploadMultiple": { type: [Object] }, "delete": {} } }], [import("./modules/health/health.controller"), { "HealthController": { "checkNetwork": { type: Object }, "checkDatabase": { type: Object }, "checkMemoryHeap": { type: Object }, "checkMemoryRSS": { type: Object }, "checkDisk": { type: Object } } }], [import("./modules/note/note.controller"), { "NoteController": { "list": {}, "findOne": { type: Object }, "create": {}, "update": {}, "delete": {}, "batchDelete": {} } }], [import("./modules/history/history.controller"), { "HistoryController": { "page": {}, "batchDelete": { type: Object } } }], [import("./modules/notification/notification.controller"), { "NotificationController": { "list": {}, "count": {} } }], [import("./modules/todo/todo.controller"), { "TodoController": { "list": {}, "findOne": {}, "create": {}, "update": {}, "delete": {}, "batchDelete": {} } }]] } };
};