/* eslint-disable */
export default async () => {
    const t = {
        ["./modules/auth/auth.model"]: await import("./modules/auth/auth.model")
    };
    return { "@nestjs/swagger": { "models": [[import("./common/dto/id.dto"), { "IdDto": {} }], [import("./common/dto/pager.dto"), { "PagerDto": {}, "CursorDto": {} }], [import("./modules/user/dto/password.dto"), { "PasswordUpdateDto": {}, "UserPasswordDto": {} }], [import("./modules/user/dto/user.dto"), { "UserDto": {}, "UserUpdateDto": {}, "UserQueryDto": {} }], [import("./modules/auth/auth.dto"), { "LoginDto": {}, "RegisterDto": {} }], [import("./modules/auth/dtos/account.dto"), { "UpdateProfileDto": {}, "ResetPasswordDto": {} }], [import("./modules/auth/captcha/captcha.dto"), { "ImageCaptchaDto": {}, "SendEmailCodeDto": {}, "SendSmsCodeDto": {}, "CheckCodeDto": {} }], [import("./common/dto/delete.dto"), { "BatchDeleteDto": {} }], [import("./modules/todo/todo.dto"), { "TodoDto": {}, "TodoUpdateDto": {}, "TodoPagerDto": {} }]], "controllers": [[import("./modules/user/user.controller"), { "UserController": { "list": {}, "getUserById": { type: Object }, "create": {}, "update": {}, "delete": {}, "password": {} } }], [import("./modules/auth/auth.controller"), { "AuthController": { "login": { type: t["./modules/auth/auth.model"].LoginResult }, "register": {} } }], [import("./modules/auth/captcha/captcha.controller"), { "CaptchaController": { "captchaByImg": { type: t["./modules/auth/auth.model"].ImageCaptcha } } }], [import("./modules/auth/controllers/account.controller"), { "AccountController": { "profile": {}, "updateProfile": {}, "logout": {}, "password": {} } }], [import("./modules/auth/controllers/email.controller"), { "EmailController": { "sendEmailCode": {} } }], [import("./modules/auth/controllers/google.controller"), { "GoogleController": { "googleAuth": {}, "googleAuthRedirect": {} } }], [import("./modules/health/health.controller"), { "HealthController": { "checkNetwork": { type: Object }, "checkDatabase": { type: Object }, "checkMemoryHeap": { type: Object }, "checkMemoryRSS": { type: Object }, "checkDisk": { type: Object } } }], [import("./modules/todo/todo.controller"), { "TodoController": { "list": {}, "findOne": {}, "create": {}, "update": {}, "delete": {}, "batchDelete": {} } }]] } };
};