import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { transformAll } from '@overgear/yup-ast';

import { makeError, makeResponse } from '@shared/functions'
import User from '@models/User'
import { ValidationError } from 'yup'
import { get as _get, isEmpty as _isEmpty } from 'lodash'
import { getAuthUser } from '@shared/accessors';
import { NotFoundError } from '@shared/exceptions';
import Post from '@models/Post';
import Reaction from '@models/Reaction';
import namdarNamDao from '@shared/badshahNamdar';
import { Storage } from '@google-cloud/storage';
import Multer from 'multer';
import { get_env } from '@shared/loadEnv';
import { Magic } from 'mmmagic';


// Init shared
const router = Router();

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
    fileFilter: (req, file, cb) => {
        if (
            !file.mimetype.includes('jpeg') &&
            !file.mimetype.includes('jpg') &&
            !file.mimetype.includes('png') &&
            !file.mimetype.includes('gif')
        ) {
            return cb(null, false, new ValidationError('Only images are allowed'));
        }
        cb(null, true);
    }
});
const storage = new Storage();
const bucket = storage.bucket(get_env('secrets.gcloud_storage_bucket'));

function mapMimeToExtension(mimetype) {
    if (mimetype.includes('jpeg') || mimetype.includes('jpg')) {
        return 'jpg';
    } else if (mimetype.includes('png')) {
        return 'png';
    }
    else if (mimetype.includes('gif')) {
        return 'gif';
    }
}

router.post('/upload', multer.single('file'), async (req: any, res, next) => {
    if (!req.file) {
        res.status(UNPROCESSABLE_ENTITY).json(makeError('No valid file uploaded.'));
        return;
    }

    // Create a new blob in the bucket and upload the file data.
    const todayDate = new Date().toISOString().slice(0, 10);
    const prefix = 'uploads/i';

    const fileNameStr = `${prefix}/${todayDate}/${namdarNamDao(7, '_')}.${mapMimeToExtension(req.file.mimetype)}`;
    const blob = bucket.file(fileNameStr);
    const blobStream = blob.createWriteStream({
        resumable: false,
    });

    blobStream.on('error', (err) => {
        next(err);
    });

    blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = `${bucket.name}/${blob.name}`;
        res.status(CREATED).json(makeResponse({ imageUrl: publicUrl }));
    });

    blobStream.end(req.file.buffer);

});



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
