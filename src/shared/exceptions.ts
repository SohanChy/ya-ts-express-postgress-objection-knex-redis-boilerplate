export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.message = `${message} Not Found`;
    }
}