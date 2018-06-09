import express from 'express';
import path from 'path';
import responseTime from 'response-time';
import {api_v1_0} from './api';


export default function init(app) {
    app.use(responseTime());
    app.use('/v1.0/api', api_v1_0);
    app.use('/doc', express.static(path.join(__dirname, '../../../doc')));
}

