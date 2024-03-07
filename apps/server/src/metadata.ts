/* eslint-disable */
export default async () => {
    const t = {
        ["./modules/auth/auth.model"]: await import("./modules/auth/auth.model")
    };
    return { "@nestjs/swagger": { "models": [[import("./modules/auth/auth.dto"), { "LoginDto": {}, "RegisterDto": {} }], [import("./common/dto/pager.dto"), { "PagerDto": {}, "CursorDto": {} }], [import("./common/dto/id.dto"), { "IdDto": {} }], [import("./modules/user/dto/password.dto"), { "PasswordUpdateDto": {}, "UserPasswordDto": {} }], [import("./modules/user/dto/user.dto"), { "UserDto": {}, "UserUpdateDto": {}, "UserQueryDto": {} }], [import("./modules/auth/dtos/account.dto"), { "UpdateProfileDto": {}, "ResetPasswordDto": {} }], [import("./modules/auth/captcha/captcha.dto"), { "ImageCaptchaDto": {}, "SendEmailCodeDto": {}, "SendSmsCodeDto": {}, "CheckCodeDto": {} }], [import("./modules/collection/collection.dto"), { "CollectionDto": {}, "CollectionUpdateDto": {}, "CollectionCursorDto": {}, "CollectionItemQueryDto": {}, "CollectionItemDto": {} }], [import("./modules/comment/comment.dto"), { "CreateCommentDto": {}, "CommentCursorDto": {}, "SubCommentCursorDto": {} }], [import("./common/dto/delete.dto"), { "BatchDeleteDto": {} }], [import("./modules/note/note.dto"), { "NoteDto": {}, "NoteUpdateDto": {}, "NoteCursorDto": {} }], [import("./modules/history/history.dto"), { "HistoryCursorDto": {} }], [import("./modules/interact/interact.dto"), { "InteractCursorDto": {} }], [import("./modules/todo/todo.dto"), { "TodoDto": {}, "TodoUpdateDto": {}, "TodoPagerDto": {} }]], "controllers": [[import("./modules/user/user.controller"), { "UserController": { "list": {}, "getUserById": {}, "create": {}, "update": {}, "delete": {}, "password": {} } }], [import("./modules/auth/auth.controller"), { "AuthController": { "login": {}, "register": {} } }], [import("./modules/auth/captcha/captcha.controller"), { "CaptchaController": { "captchaByImg": { type: t["./modules/auth/auth.model"].ImageCaptcha } } }], [import("./modules/auth/controllers/account.controller"), { "AccountController": { "profile": {}, "updateProfile": {}, "logout": {}, "password": {} } }], [import("./modules/auth/controllers/email.controller"), { "EmailController": { "sendEmailCode": {} } }], [import("./modules/auth/controllers/google.controller"), { "GoogleController": { "googleAuth": {}, "googleAuthRedirect": {} } }], [import("./modules/history/history.controller"), { "HistoryController": { "page": {}, "batchDelete": { type: Object } } }], [import("./modules/note/note.controller"), { "NoteController": { "list": {}, "findOne": { type: Object }, "create": {}, "update": {}, "delete": {}, "batchDelete": {} } }], [import("./modules/comment/comment.controller"), { "CommentController": { "page": {}, "list": {}, "create": {}, "like": { type: Boolean }, "delete": {} } }], [import("./modules/health/health.controller"), { "HealthController": { "checkNetwork": { type: Object }, "checkDatabase": { type: Object }, "checkMemoryHeap": { type: Object }, "checkMemoryRSS": { type: Object }, "checkDisk": { type: Object } } }], [import("./modules/todo/todo.controller"), { "TodoController": { "list": {}, "findOne": {}, "create": {}, "update": {}, "delete": {}, "batchDelete": {} } }]] } };
};