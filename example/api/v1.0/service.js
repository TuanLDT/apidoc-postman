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
     * @api {get} /v1.0/api/service Danh sách service
     * @apiVersion 1.0.0
     * @apiName getListService
     * @apiGroup Service
     * 
     * @apiDescription Lấy danh sách service
     *
     * @apiParam {Number} [page=0] 
     * @apiParam {Number} [size=20]
     * @apiParam {String} [code]           Lọc service theo code
     * @apiParam {String} [name]            Lọc service theo tên
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data    Dữ liệu trả về khi lấy danh sách service
     * @apiSuccess {Number} data.count Tổng số service
     * @apiSuccess {Array}  data.items Mảng chứa các object gồm thông tin về service
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *             "count": 2,
     *             items: [
     *                 {
     *                      "_id": "5b1977c2132f3817248aa82b",
     *                      "code": "1",
     *                      "name": "dịch vụ 1",
     *                      "description": "Dịch vụ 1",
     *                      "attributes": {}
     *                  },
     *                  {
     *                      "_id": "5b197861132f3817248aa82c",
     *                      "code": "2",
     *                      "name": "dịch vụ 2",
     *                      "description": "Dịch vụ 2",
     *                      "attributes": {}
     *                  },
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
                code,
                name,
                description,
                attributes
            }
        }`;

        return schemaApi.query.services({
            params: query,
            response
        });
    }

    /**
     * @api {get} /v1.0/api/service/:_id Lấy thông tin service
     * @apiVersion 1.0.0
     * @apiName ServiceInfo
     * @apiGroup Service
     * 
     * @apiDescription Lấy thông tin dựa trên _id
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của service
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         "data": {
     *              "_id": "5b1977c2132f3817248aa82b",
     *              "code": "1",
     *              "name": "dịch vụ 1",
     *              "description": "Dịch vụ 1",
     *              "attributes": {}
     *          }
     *     }
     */
    @route.get('/:_id')
    _getInfo({query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            code,
            name,
            description,
            attributes
        }`;

        return schemaApi.query.serviceInfo({
            params,
            response
        });
    }

    /**
     * @api {put} /v1.0/api/service/:_id Sửa service
     * @apiVersion 1.0.0
     * @apiName EditService
     * @apiGroup Service
     * 
     * @apiDescription Sửa thông tin dựa trên _id
     *
     * @apiParam {String} [name]  Tên dịch vụ
     * @apiParam {String} [description] Mô tả dịch vụ
     * @apiParam {Object} [attributes] Các thuộc tính của dịch vụ
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của service đã sửa
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       "data": {
     *           "_id": "5b1977c2132f3817248aa82b",
     *           "code": "1",
     *           "name": "dịch vụ 1",
     *           "description": "Dịch vụ 1",
     *           "attributes": {}
     *       }
     *     }
     */
    @route.put('/:_id')
    _edit({body, query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            code,
            name,
            description,
            attributes
        }`;

        return schemaApi.mutation.editService({
            params: {
                ...body,
                ...params
            },
            response
        });
    }

    /**
     * @api {post} /v1.0/api/service Tạo service
     * @apiVersion 1.0.0
     * @apiName CreateService
     * @apiGroup Service
     * 
     * @apiDescription Tạo service
     *
     * @apiParam {String} code Mã dịch vụ
     * @apiParam {String} [name]  Tên dịch vụ
     * @apiParam {String} [description] Mô tả dịch vụ
     * @apiParam {Object} [attributes] Các thuộc tính của dịch vụ
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của service vừa tạo
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       "data": {
     *           "_id": "5b1977c2132f3817248aa82b",
     *           "code": "1",
     *           "name": "service 1",
     *           "description": "",
     *           "attributes": {}
     *       }
     *     }
     */
    
    @route.post('/')
    _create({body, query}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            code,
            name,
            description,
            attributes
        }`;

        return schemaApi.mutation.createService({
            params: body,
            response
        });
    }

    /**
     * @api {delete} /v1.0/api/service/:_id Xóa service
     * @apiVersion 1.0.0
     * @apiName DeleteService
     * @apiGroup Service
     * 
     * @apiDescription Xóa service dựa trên _id
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
        await schemaApi.mutation.deleteService({
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