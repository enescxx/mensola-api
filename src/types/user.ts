interface IUser {
    id: string;
    email: string;
    username: string;
    fullname?: string;
    password: string;
    bio?: string;
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

export { IUser, RegisterRequest, LoginRequest };
