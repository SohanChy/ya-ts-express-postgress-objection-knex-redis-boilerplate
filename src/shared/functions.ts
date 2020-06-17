import logger from './Logger';
import { ValidationError } from 'yup';

export const pErr = (err: Error) => {
    if (err) {
        logger.error(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

export const makeError = (message: string, meta: object = {}): object => {
    return {
        success: false, message, meta
    }
}

export const makeValidationError = (err: ValidationError): object => {
    return {
        success: false,
        message: err.message,
        meta: {
            'error_type': 'validation_error',
            'path': err.path,
            'payload': err.value
        }
    }
}

export const makeResponse = (data: object | string): object => {
    if (typeof data === 'string' || data instanceof String) {
        return {
            success: true,
            message: data
        }
    }
    return {
        success: true,
        data
    }
}