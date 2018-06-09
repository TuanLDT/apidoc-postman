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
     * @api {get} /v1.0/api/customer Danh sách customer
     * @apiVersion 1.0.0
     * @apiName getListCustomer
     * @apiGroup Customer
     * 
     * @apiDescription Lấy danh sách customer
     *
     * @apiParam {Number} [page=0] 
     * @apiParam {Number} [size=20]
     * @apiParam {String} [code]                Lọc customer theo code
     * @apiParam {String} [name]                Lọc customer theo name
     * @apiParam {String} [address]             Lọc customer theo address
     * @apiParam {String} [phoneNumber]         Lọc customer theo phoneNumber
     * @apiParam {String} [email]               Lọc customer theo email
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data    Dữ liệu trả về khi lấy danh sách customer
     * @apiSuccess {Number} data.count Tổng số customer
     * @apiSuccess {Array}  data.items Mảng chứa các object gồm thông tin về customer
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *             "count": 2,
     *             items: [
     *                 {
     *                      "_id": "5b18b03dce7eeb3540fb42cb",
     *                      "code": "1",
     *                      "name": "Customer 1",
     *                      "address": null,
     *                      "phoneNumber": null,
     *                      "contact": null,
     *                      "representative": null,
     *                      "email": null,
     *                      "attributes": {}
     *                 },{
     *                      "_id": "5b194bbac2df7405600ae719",
     *                      "code": "2",
     *                      "name": "Customer 2",
     *                      "address": "Thanh Xuân",
     *                      "phoneNumber": "0904725791",
     *                      "contact": null,
     *                      "representative": null,
     *                      "email": "thanhtuan.pfiev@gmail.com",
     *                      "attributes": {}
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
                code,
                name,
                address,
                phoneNumber,
                contact, 
                representative,
                email,
                attributes
            }
        }`;

        return schemaApi.query.customers({
            params: query,
            response
        });
    }

    /**
     * @api {get} /v1.0/api/customer/:_id Lấy thông tin customer
     * @apiVersion 1.0.0
     * @apiName CustomerInfo
     * @apiGroup Customer
     * 
     * @apiDescription Lấy thông tin dựa trên _id
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của customer
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         code: 200,
     *         message: "SUCCESS",
     *         data: {
     *            "_id": "5b18b03dce7eeb3540fb42cb",
     *            "code": "1",
     *            "name": "Customer 1",
     *            "address": null,
     *            "phoneNumber": null,
     *            "contact": null,
     *            "representative": null,
     *            "email": null,
     *            "attributes": {}
     *         }
     *     }
     */
    @route.get('/:_id')
    _getInfo({query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            code,
            name,
            address,
            phoneNumber,
            contact, 
            representative,
            email,
            attributes
        }`;

        return schemaApi.query.customerInfo({
            params,
            response
        });
    }

    /**
     * @api {put} /v1.0/api/customer/:_id Sửa customer
     * @apiVersion 1.0.0
     * @apiName EditCustomer
     * @apiGroup Customer
     * 
     * @apiDescription Sửa thông tin dựa trên _id
     *
     * @apiParam {String} [name]
     * @apiParam {String} [address]
     * @apiParam {String} [phoneNumber]
     * @apiParam {String} [contact]
     * @apiParam {String} [representative]
     * @apiParam {String} [email]
     * @apiParam {String} [attributes]
     *
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của customer đã sửa
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "code": 200,
     *       "message": "SUCCESS",
     *       data: {
     *            "_id": "5b18b03dce7eeb3540fb42cb",
     *            "code": "1",
     *            "name": "Edit name",
     *            "address": null,
     *            "phoneNumber": null,
     *            "contact": null,
     *            "representative": null,
     *            "email": null,
     *            "attributes": {}
     *         }
     *     }
     */
    @route.put('/:_id')
    _edit({body, query, params}) {
        let response = query.fields ? `{${query.fields}}` : `{
            _id,
            code,
            name,
            address,
            phoneNumber,
            contact, 
            representative,
            email,
            attributes
        }`;

        return schemaApi.mutation.editCustomer({
            params: {
                ...body,
                ...params
            },
            response
        });
    }

    /**
     * @api {post} /v1.0/api/customer Tạo customer
     * @apiVersion 1.0.0
     * @apiName CreateCustomer
     * @apiGroup Customer
     * 
     * @apiDescription Tạo customer
     *
     * @apiParam {String} code Mã khách hàng
     * @apiParam {String} [name] Tên khách hàng
     * @apiParam {String} [address] Địa chỉ khách hàng
     * @apiParam {String} [phoneNumber] Số điện thoại liên hệ
     * @apiParam {String} [contact] Người liên hệ(id tham chiếu tới contact)
     * @apiParam {String} [representative] Đại diện pháp nhân(id tham chiếu tới contact)
     * @apiParam {String} [email] Email liên hệ
     * @apiParam {Object} [attributes] Object lưu các thuộc tính
     * 
     * @apiSuccess {Number} code=200
     * @apiSuccess {String} message="SUCCESS"
     * @apiSuccess {Object} data Object chứa thông tin của customer vừa tạo
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
            code,
            name,
            address,
            phoneNumber,
            contact, 
            representative,
            email,
            attributes
        }`;

        return schemaApi.mutation.createCustomer({
            params: body,
            response
        });
    }

    /**
     * @api {delete} /v1.0/api/customer/:_id Xóa customer
     * @apiVersion 1.0.0
     * @apiName DeleteCustomer
     * @apiGroup Customer
     * 
     * @apiDescription Xóa customer dựa trên _id
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
        await schemaApi.mutation.deleteCustomer({
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