interface IUser {
    id: string;
    email: string;
    username: string;
    fullname?: string;
    bio?: string;
    password?: string;
    favMoviesList?: string;
    favMusicsList?: string;
    resetToken?: string;
    resetTokenExpires?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

interface ISession {
    id: string;
    userId: string;
    refreshToken: string;
    createdAt?: Date | string;
}

interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

export { IUser, ISession, RegisterRequest, LoginRequest };
