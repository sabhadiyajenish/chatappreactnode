export const DBname = "videotube";
export const cookieOptions = {
    httpOnly: true,
    secure: true
}
export const UserLoginType = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

export const AvailableSocialLogins = Object.values(UserLoginType);

export const UserRolesEnum = {
    ADMIN: "ADMIN",
    USER: "USER",
};
export const AvailableUserRoles = Object.values(UserRolesEnum);