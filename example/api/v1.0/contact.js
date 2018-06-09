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
     * @api {get} /v1.0/api/contact Danh sách contact
     * @apiVersion 1.0.0
     * @apiName getListContact
     * @apiGroup Contact
     * 
     * @apiDescription Lấy danh sách contact
     *
     * @apiParam {Number} [page=0] 
     * @apiParam {Number} [size=20]
     * @apiParam {String} [firstName]           Lọc contact theo tên
     * @apiParam {String} [lastName]            Lọc contact theo họ
     * @apiParam {String} [address]             Lọc contact theo địa chỉ khách hàng
     * @apiParam {String="male","female"} [gender]              Lọc contact theo giới tính
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data    Dữ liệu trả về khi lấy danh sách contact
     * @apiSuccess {Number} data.count Tổng số contact
     * @apiSuccess {Array}  data.items Mảng chứa các object gồm thông tin về contact
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *             "count": 2,
     *             items: [
     *                 {
     *                      "_id": "5b1967b2ea4af70508ffed71",
     *                      "firstName": "Giang",
     *                      "lastName": "Lê",
     *                      "address": "Sóc Sơn",
     *                      "phoneNumbers": [
     *                          "0904725791"
     *                      ],
     *                      "emails": [
     *                          "legiang@gmail.com"
     *                      ],
     *                      "gender": "male"
     *                  },
     *                  {
     *                      "_id": "5b196793ea4af70508ffed70",
     *                      "firstName": "Tuấn",
     *                      "lastName": "Lê",
     *                      "address": "Thanh Xuân",
     *                      "phoneNumbers": [
     *                          "0904725792"
     *                      ],
     *                      "emails": [
     *                          "thanhtuan@gmail.com"
     *                      ],
     *                      "gender": "male"
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
                firstName,
                lastName,
                address,
                phoneNumbers,
                emails,
                gender
            }
        }`;

        return schemaApi.query.contacts({
            params: query,
            response
        });
    }

    /**
     * @api {get} /v1.0/api/contact/:_id Lấy thông tin contact
     * @apiVersion 1.0.0
     * @apiName ContactInfo
     * @apiGroup Contact
     * 
     * @apiDescription Lấy thông tin dựa trên _id
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của contact
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *            "_id": "5b196793ea4af70508ffed70",
     *            "firstName": "Tuấn",
     *            "lastName": "Lê",
     *            "address": "Thanh Xuân",
     *            "phoneNumbers": [
     *                "0904725792"
     *            ],
     *            "emails": [
     *                "thanhtuan@gmail.com"
     *            ],
     *            "gender": "male"
     *         }
     *     }
     */
    @route.get('/:_id')
    _getInfo({query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            firstName,
            lastName,
            address,
            phoneNumbers,
            emails,
            gender
        }`;

        return schemaApi.query.contactInfo({
            params,
            response
        });
    }

    /**
     * @api {put} /v1.0/api/contact/:_id Sửa contact
     * @apiVersion 1.0.0
     * @apiName EditContact
     * @apiGroup Contact
     * 
     * @apiDescription Sửa thông tin dựa trên _id
     *
     * @apiParam {String} [firstName]
     * @apiParam {String} [lastName]
     * @apiParam {String} [address]
     * @apiParam {[String]} [phoneNumbers]
     * @apiParam {[String]} [emails]
     * @apiParam {String="male","female"} [gender]
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của contact đã sửa
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       data: {
     *            "_id": "5b196793ea4af70508ffed70",
     *            "firstName": "Tuấn",
     *            "lastName": "Lê Đắc Thanh",
     *            "address": "Thanh Xuân",
     *            "phoneNumbers": [
     *                "0904725792",
     *                "0984665668"
     *            ],
     *            "emails": [
     *                "thanhtuan@gmail.com"
     *            ],
     *            "gender": "male"
     *         }
     *     }
     */
    @route.put('/:_id')
    _edit({body, query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            firstName,
            lastName,
            address,
            phoneNumbers,
            emails,
            gender
        }`;

        return schemaApi.mutation.editContact({
            params: {
                ...body,
                ...params
            },
            response
        });
    }

    /**
     * @api {post} /v1.0/api/contact Tạo contact
     * @apiVersion 1.0.0
     * @apiName CreateContact
     * @apiGroup Contact
     * 
     * @apiDescription Tạo contact
     *
     * @apiParam {String} firstName Tên
     * @apiParam {String} lastName  Họ
     * @apiParam {String} [address] Địa chỉ liên hệ
     * @apiParam {[String]} [phoneNumbers] Mảng các số điện thoại
     * @apiParam {[String]} [emails] Mảng các email
     * @apiParam {String="male","female"} [gender] Giới tính
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của contact vừa tạo
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       "data": {
     *           "_id": "5b1967b2ea4af70508ffed71",
     *           "firstName": "Giang",
     *           "lastName": "Lê",
     *           "address": "Sóc Sơn",
     *           "phoneNumbers": [
     *               "0904725791"
     *           ],
     *           "emails": [
     *               "legiang@gmail.com"
     *           ],
     *           "gender": "male"
     *       }
     *     }
     */
    
    @route.post('/')
    _create({body, query}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            firstName,
            lastName,
            address,
            phoneNumbers,
            emails,
            gender
        }`;

        return schemaApi.mutation.createContact({
            params: body,
            response
        });
    }

    /**
     * @api {delete} /v1.0/api/contact/:_id Xóa contact
     * @apiVersion 1.0.0
     * @apiName DeleteContact
     * @apiGroup Contact
     * 
     * @apiDescription Xóa contact dựa trên _id
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
        await schemaApi.mutation.deleteContact({
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