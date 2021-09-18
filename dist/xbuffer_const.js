"use strict";
/**
 * buffer相关的常量
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumBufferSize = exports.EnumErrBuffer = exports.DEFAULT_CAPACITY = exports.CAPACITY_BLOCK_SIZE = void 0;
/** 容量最小块的字节数 */
exports.CAPACITY_BLOCK_SIZE = 256;
/** 缺省容量 256K */
exports.DEFAULT_CAPACITY = 256 * 1024;
/**
 * XBuffer对应的错误码
 */
var EnumErrBuffer;
(function (EnumErrBuffer) {
    EnumErrBuffer[EnumErrBuffer["OK"] = 0] = "OK";
    EnumErrBuffer[EnumErrBuffer["FAIL"] = -1] = "FAIL";
    /** 超过了最大容量 */
    EnumErrBuffer[EnumErrBuffer["OUT_OF_MAX"] = 1] = "OUT_OF_MAX";
    /** 无效的容量值 */
    EnumErrBuffer[EnumErrBuffer["INVALID_CAPACITY_VALUE"] = 2] = "INVALID_CAPACITY_VALUE";
    /** 分配内存失败，请检查内存是否足够 */
    EnumErrBuffer[EnumErrBuffer["ALLOC_BUFFER_FAIL"] = 3] = "ALLOC_BUFFER_FAIL";
    /** 无效的新位置 */
    EnumErrBuffer[EnumErrBuffer["INVALID_NEW_POS"] = 4] = "INVALID_NEW_POS";
    /** 超出有效位置范围 */
    EnumErrBuffer[EnumErrBuffer["OUT_OF_POS"] = 5] = "OUT_OF_POS";
    /** 数据为NULL */
    EnumErrBuffer[EnumErrBuffer["DATA_IS_NULL"] = 11] = "DATA_IS_NULL";
    /** 数据不是Buffer对象 */
    EnumErrBuffer[EnumErrBuffer["DATA_IS_NOT_BUFFER"] = 12] = "DATA_IS_NOT_BUFFER";
    /** 超出范围 */
    EnumErrBuffer[EnumErrBuffer["OUT_OF_RANGE"] = 13] = "OUT_OF_RANGE";
    /** 不够删除 */
    EnumErrBuffer[EnumErrBuffer["NOT_ENOUGH_BY_DEL"] = 14] = "NOT_ENOUGH_BY_DEL";
    /** 不是有效的删除字节数 */
    EnumErrBuffer[EnumErrBuffer["INVALID_BYTES_BY_DEL"] = 15] = "INVALID_BYTES_BY_DEL";
    /** 要读取的字节数不够 */
    EnumErrBuffer[EnumErrBuffer["READ_BYTES_NOT_ENOUGH"] = 20] = "READ_BYTES_NOT_ENOUGH";
    /** 要读取的字节数，小于1 */
    EnumErrBuffer[EnumErrBuffer["READ_BYTES_LE_ONE"] = 21] = "READ_BYTES_LE_ONE";
    /**n 参数不是安全范围内的整数 */
    EnumErrBuffer[EnumErrBuffer["PARAM_IS_NOT_SAFE_INT"] = 30] = "PARAM_IS_NOT_SAFE_INT";
})(EnumErrBuffer = exports.EnumErrBuffer || (exports.EnumErrBuffer = {}));
/**
 * 读取对应的数据类型，对应的字节数
 */
var EnumBufferSize;
(function (EnumBufferSize) {
    /** 8位整数的字节数 */
    EnumBufferSize[EnumBufferSize["int8"] = 1] = "int8";
    /** 16位整数的字节数 */
    EnumBufferSize[EnumBufferSize["int16"] = 2] = "int16";
    /** 32位整数的字节数 */
    EnumBufferSize[EnumBufferSize["int32"] = 4] = "int32";
    /** 64位整数的字节数 */
    EnumBufferSize[EnumBufferSize["int64"] = 8] = "int64";
    /** 单精度浮点数字节数 */
    EnumBufferSize[EnumBufferSize["float"] = 4] = "float";
    /** 双精度浮点数字节数 */
    EnumBufferSize[EnumBufferSize["double"] = 8] = "double";
})(EnumBufferSize = exports.EnumBufferSize || (exports.EnumBufferSize = {}));
