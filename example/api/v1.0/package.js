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
     * @api {get} /v1.0/api/package Danh sách package
     * @apiVersion 1.0.0
     * @apiName getListPackage
     * @apiGroup Package
     * 
     * @apiDescription Lấy danh sách package
     *
     * @apiParam {Number} [page=0] 
     * @apiParam {Number} [size=20]
     * @apiParam {String} [code]           Lọc package theo code
     * @apiParam {String} [name]            Lọc package theo tên
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data    Dữ liệu trả về khi lấy danh sách package
     * @apiSuccess {Number} data.count Tổng số package
     * @apiSuccess {Array}  data.items Mảng chứa các object gồm thông tin về package
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *             "count": 2,
     *             items: [
     *                 {
     *                      "_id": "5b197e64670ac619907d14f7",
     *                      "code": "1",
     *                      "name": "Gói dịch vụ 1",
     *                      "service": null,
     *                      "attributes": {}
     *                  },
     *                  {
     *                      "_id": "5b197e77670ac619907d14f8",
     *                      "code": "2",
     *                      "name": "Gói dịch vụ 2",
     *                      "service": "5b1977c2132f3817248aa82b",
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
                service,
                attributes
            }
        }`;

        return schemaApi.query.packages({
            params: query,
            response
        });
    }

    /**
     * @api {get} /v1.0/api/package/:_id Lấy thông tin package
     * @apiVersion 1.0.0
     * @apiName PackageInfo
     * @apiGroup Package
     * 
     * @apiDescription Lấy thông tin dựa trên _id
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của package
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
            service,
            attributes
        }`;

        return schemaApi.query.packageInfo({
            params,
            response
        });
    }

    /**
     * @api {put} /v1.0/api/package/:_id Sửa package
     * @apiVersion 1.0.0
     * @apiName EditPackage
     * @apiGroup Package
     * 
     * @apiDescription Sửa thông tin dựa trên _id
     *
     * @apiParam {String} [name]  Tên gói dịch vụ
     * @apiParam {String} [service] Dịch vụ
     * @apiParam {Object} [attributes] Các thuộc tính của gói dịch vụ
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của package đã sửa
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       "data": {
     *           "_id": "5b197e77670ac619907d14f8",
     *           "code": "2",
     *           "name": "Gói dịch vụ 2",
     *           "service": "5b1977c2132f3817248aa82b",
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
            service,
            attributes
        }`;

        return schemaApi.mutation.editPackage({
            params: {
                ...body,
                ...params
            },
            response
        });
    }

    /**
     * @api {post} /v1.0/api/package Tạo package
     * @apiVersion 1.0.0
     * @apiName CreatePackage
     * @apiGroup Package
     * 
     * @apiDescription Tạo package
     *
     * @apiParam {String} code Mã gói dịch vụ
     * @apiParam {String} name  Tên gói dịch vụ
     * @apiParam {String} [service] Dịch vụ
     * @apiParam {Object} [attributes] Các thuộc tính của gói dịch vụ
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của package vừa tạo
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       "data": {
     *           "_id": "5b197e77670ac619907d14f8",
     *           "code": "2",
     *           "name": "package 2",
     *           "service": "5b1977c2132f3817248aa82b",
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
            service,
            attributes
        }`;

        return schemaApi.mutation.createPackage({
            params: body,
            response
        });
    }

    /**
     * @api {delete} /v1.0/api/package/:_id Xóa package
     * @apiVersion 1.0.0
     * @apiName DeletePackage
     * @apiGroup Package
     * 
     * @apiDescription Xóa package dựa trên _id
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
        await schemaApi.mutation.deletePackage({
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