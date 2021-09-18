/**
 * buffer相关的常量
 */

import { error_common } from "xmcommon";

/** 容量最小块的字节数 */
export const CAPACITY_BLOCK_SIZE = 256;

/** 缺省容量 256K */
export const DEFAULT_CAPACITY = 256*1024;

/**
 * XBuffer对应的错误码
 */
export enum EnumErrBuffer {
    OK                      = error_common.ERR_OK,
    FAIL                    = error_common.ERR_FAIL,

    /** 超过了最大容量 */
    OUT_OF_MAX              = 1,
    /** 无效的容量值 */
    INVALID_CAPACITY_VALUE  = 2,
    /** 分配内存失败，请检查内存是否足够 */
    ALLOC_BUFFER_FAIL       = 3,
    /** 无效的新位置 */
    INVALID_NEW_POS         = 4,
    /** 超出有效位置范围 */
    OUT_OF_POS              = 5,

    /** 数据为NULL */
    DATA_IS_NULL            = 11,
    /** 数据不是Buffer对象 */
    DATA_IS_NOT_BUFFER      = 12,
    /** 超出范围 */
    OUT_OF_RANGE            = 13,
    /** 不够删除 */
    NOT_ENOUGH_BY_DEL       = 14,
    /** 不是有效的删除字节数 */
    INVALID_BYTES_BY_DEL    = 15,


    /** 要读取的字节数不够 */
    READ_BYTES_NOT_ENOUGH   = 20,
    /** 要读取的字节数，小于1 */
    READ_BYTES_LE_ONE       = 21,
    /**n 参数不是安全范围内的整数 */
    PARAM_IS_NOT_SAFE_INT   = 30,
}

/**
 * 读取对应的数据类型，对应的字节数
 */
export enum EnumBufferSize {
    /** 8位整数的字节数 */
    int8    = 1,
    /** 16位整数的字节数 */
    int16   = 2,
    /** 32位整数的字节数 */
    int32   = 4,
    /** 64位整数的字节数 */
    int64   = 8,
    /** 单精度浮点数字节数 */
    float   = 4,
    /** 双精度浮点数字节数 */
    double  = 8
}
