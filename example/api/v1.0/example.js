import express from 'express';
import {route} from '../../../util';

import schemaApi from '../../../graphql/schema_api';

const router = express.Router();

/**
 * Xử lý 
 * class Api
 */
class Api {

    /**
     * @api {get} /v1.0/api/example Danh sách example
     * @apiVersion 1.0.0
     * @apiName getListExample
     * @apiGroup Example
     * 
     * @apiDescription Lấy danh sách example
     *
     * @apiParam {Number} [page=0] 
     * @apiParam {Number} [size=20]
     * @apiParam {String} [name]        Lọc các example theo name
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data    Dữ liệu trả về khi lấy danh sách example
     * @apiSuccess {Number} data.count Tổng số example
     * @apiSuccess {Array}  data.items Mảng chứa các object gồm thông tin về example
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *             count: 3,
     *             items: [
     *                 {
     *                      "_id": "5b17654f6984452a243c632e",
     *                      "_id": "ex 1",
     *                 },{
     *                      "_id": "5b1765516984452a243c632f",
     *                      "_id": "ex 2",
     *                 },{
     *                      "_id": "5b1767cfa8255412c89fdb8f",
     *                      "_id": "ex 3",
     *                 }
     *             ]
     *             
     *         }
     *     
     *     }
     */
    @route.get('/')
    _getList({query}) {
        let response = query.fields ? `{${query.fields}}` : `{
            count,
            items {
                _id,
                name
            }
        }`;

        return schemaApi.query.examples({
            params: query,
            response
        });
    }

    /**
     * @api {get} /v1.0/api/example/:_id Lấy thông tin example
     * @apiVersion 1.0.0
     * @apiName ExampleInfo
     * @apiGroup Example
     * 
     * @apiDescription Lấy thông tin dựa trên _id
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của example
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *             "_id": "5a68299aa061533ca4af1be7",
     *             "name": "example 1"
     *         }
     *     }
     */
    @route.get('/:_id')
    _getInfo({query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            name
        }`;

        return schemaApi.query.exampleInfo({
            params,
            response
        });
    }

    /**
     * @api {put} /v1.0/api/example/:_id Sửa example
     * @apiVersion 1.0.0
     * @apiName EditExample
     * @apiGroup Example
     * 
     * @apiDescription Sửa thông tin dựa trên _id
     *
     * @apiParam {String} [name]
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của example đã sửa
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       "data": {
     *           "_id": "5b17660a170a9901ac5879be",
     *           "name": "test edit"
     *       }
     *     }
     */
    @route.put('/:_id')
    _edit({body, query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            name
        }`;

        return schemaApi.mutation.editExample({
            params: {
                ...body,
                ...params
            },
            response
        });
    }

    /**
     * @api {post} /v1.0/api/example Tạo example
     * @apiVersion 1.0.0
     * @apiName CreateExample
     * @apiGroup Example
     * 
     * @apiDescription Tạo example
     *
     * @apiParam {String} name Tên của example
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của example vừa tạo
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       "data": {
     *           "_id": "5b1756f16d52a31fa80278f1",
     *           "name": "test 1"
     *       }
     *     }
     */
    
    @route.post('/')
    _create({body, query}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            name
        }`;

        return schemaApi.mutation.createExample({
            params: body,
            response
        });
    }

    /**
     * @api {delete} /v1.0/api/example/:_id Xóa example
     * @apiVersion 1.0.0
     * @apiName DeleteExample
     * @apiGroup Example
     * 
     * @apiDescription Xóa example dựa trên _id
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *     }
     */
    @route.delete('/:_id')
    async _delete({params}) {
        await schemaApi.mutation.deleteExample({
            params
        });

        return null;
    }
}

route.register(
    {
        router,
        target: new Api()
    }

);

export default router;