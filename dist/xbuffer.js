"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XPackageReader = exports.XPackageWriter = exports.XBuffer = void 0;
/**
 * 这里实现了消息包拼包，需要的buffer读写类
 */
const buffer_1 = require("buffer");
const xbuffer_const_1 = require("./xbuffer_const");
/**
 * 是这一个基于Buffer之上的扩展buffer, 主要用于动态扩展buffer空间，预分配空间等
 */
class XBuffer {
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    constructor(paramCapacity, paramFillByte) {
        /** 当前的位置 */
        this.m_pos = 0;
        /**
         * 最后用效的位置 m_valid_Pos >= m_pos
         * - 在writeBuffer这m_valid_Pos是无效的
         */
        this.m_valid_pos = 0;
        let cap = xbuffer_const_1.DEFAULT_CAPACITY;
        if (Number.isSafeInteger(paramCapacity)) {
            cap = paramCapacity;
        }
        if (XBuffer.checkFillByte(paramFillByte)) {
            this.m_data = Buffer.alloc(cap, paramFillByte);
        }
        else {
            this.m_data = Buffer.allocUnsafe(cap);
        }
    }
    /**
     * 检查是否是有效的填充字节
     * @param paramFillByte 填充的字节，只支待0-255的数字
     *  - true 表示是有效的填充字节
     *  - false 表示不是有效的填充字节
     */
    static checkFillByte(paramFillByte) {
        if (!Number.isSafeInteger(paramFillByte)) {
            return false;
        }
        return paramFillByte >= 0 && paramFillByte <= 255;
    }
    /**
     * 确定容量
     * @param paramCapacity 确的容量
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    ensureCapacity(paramCapacity, paramFillByte) {
        if ((!Number.isSafeInteger(paramCapacity) || paramCapacity < 0)) {
            return xbuffer_const_1.EnumErrBuffer.INVALID_CAPACITY_VALUE;
        }
        if (this.capacity >= paramCapacity) {
            return xbuffer_const_1.EnumErrBuffer.OK;
        }
        return this.expandCapacity(paramCapacity, paramFillByte);
    }
    /**
     * 扩展到最小容量
     * 注意：这里不会对传入的容量，做类型以及值域检查
     * @private 私有函数，请不要对外使用
     * @param paramMinCapacity 要求的最小容量  这里要求是有效的整数
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     * @return 检查后的错误码
     *  - 0 表示扩展容量成功
     *  -
     */
    expandCapacity(paramMinCapacity, paramFillByte) {
        const nowCapacity = this.capacity;
        // 如果当前空量满足要求，
        if (nowCapacity >= paramMinCapacity) {
            return xbuffer_const_1.EnumErrBuffer.OK;
        }
        // 如果超出最大容量
        if (paramMinCapacity > buffer_1.constants.MAX_LENGTH) {
            return xbuffer_const_1.EnumErrBuffer.OUT_OF_MAX;
        }
        const doubleNowCapacity = nowCapacity * 2;
        let newCapacity = paramMinCapacity;
        if (newCapacity < doubleNowCapacity) {
            newCapacity = doubleNowCapacity;
        }
        // 将容量设为指定块的整数倍
        const mod = newCapacity % xbuffer_const_1.CAPACITY_BLOCK_SIZE;
        if (mod > 0) {
            newCapacity += (xbuffer_const_1.CAPACITY_BLOCK_SIZE - mod);
        }
        // 如果计算出来的容量，大于最大容量, 则将容量设为最大容量
        if (newCapacity > buffer_1.constants.MAX_LENGTH) {
            newCapacity = buffer_1.constants.MAX_LENGTH;
        }
        const old_data = this.m_data;
        try {
            const new_data = XBuffer.checkFillByte(paramFillByte) ? Buffer.alloc(newCapacity, paramFillByte) : Buffer.allocUnsafe(newCapacity);
            this.m_data = new_data;
        }
        catch (e) {
            return xbuffer_const_1.EnumErrBuffer.ALLOC_BUFFER_FAIL;
        }
        const endPos = this.m_valid_pos;
        if (endPos > 0) {
            // 复制有效数据
            old_data.copy(this.m_data, 0, 0, endPos);
        }
        return xbuffer_const_1.EnumErrBuffer.OK;
    }
    /**
     * 当前容量
     */
    get capacity() {
        return this.m_data.length;
    }
    /** 当前位置 */
    get pos() {
        return this.m_pos;
    }
    /** 当前的数据 */
    get data() {
        return this.m_data;
    }
    get_valid_pos() {
        return this.m_valid_pos;
    }
    /**
     * 设置新位置，会做检查
     * @param paramNewPos 新位置，位置范围是[0,capacity)
     * @return 设置结果
     *  - 0 表示设置成功
     *  - 其它值，表示设置错误
     */
    setPos(paramNewPos) {
        if (!Number.isSafeInteger(paramNewPos)) {
            return xbuffer_const_1.EnumErrBuffer.INVALID_NEW_POS;
        }
        if (paramNewPos < 0 || paramNewPos >= this.capacity) {
            return xbuffer_const_1.EnumErrBuffer.OUT_OF_POS;
        }
        this.m_pos = paramNewPos;
        return xbuffer_const_1.EnumErrBuffer.OK;
    }
    /**
     * 设置新位置
     * - 不做检查，请确保新位置是整数，且范围是[0,capacity)
     * - 对于已知的操作，减少检查，来提高性能
     * @param paramNewPos 新位置
     */
    setPosUncheck(paramNewPos) {
        this.m_pos = paramNewPos;
    }
    toJSON() {
        return {
            capacity: this.capacity,
            pos: this.m_pos,
            valid_pos: this.m_valid_pos,
            data: this.m_data
        };
    }
}
exports.XBuffer = XBuffer;
class XPackageWriter extends XBuffer {
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    constructor(paramCapacity, paramFillByte) {
        super(paramCapacity, paramFillByte);
    }
    isCanWrite(paramBytes) {
        if (!Number.isSafeInteger(paramBytes)) {
            return false;
        }
        if (paramBytes < 1) {
            return false;
        }
        return (this.m_pos + paramBytes) <= this.capacity;
    }
    /** 是否可读写8位整数 */
    isCanWriteInt8() {
        return this.isCanWrite(xbuffer_const_1.EnumBufferSize.int8);
    }
    /** 是否可读写16位整数 */
    isCanWriteInt16() {
        return this.isCanWrite(xbuffer_const_1.EnumBufferSize.int16);
    }
    /** 是否可读写32位整数 */
    isCanWriteInt32() {
        return this.isCanWrite(xbuffer_const_1.EnumBufferSize.int32);
    }
    /** 是否可读写64位整数 */
    isCanWriteInt64() {
        return this.isCanWrite(xbuffer_const_1.EnumBufferSize.int64);
    }
    /** 是否可读写单精度浮点数 */
    isCanWriteFloat() {
        return this.isCanWrite(xbuffer_const_1.EnumBufferSize.float);
    }
    /** 是否可读写双精度浮点数 */
    isCanWriteDoublie() {
        return this.isCanWrite(xbuffer_const_1.EnumBufferSize.double);
    }
    writeInt8(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.int8);
        this.m_data.writeInt8(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int8;
        this.m_valid_pos = this.m_pos;
    }
    writeUInt8(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.int8);
        this.m_data.writeUInt8(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int8;
        this.m_valid_pos = this.m_pos;
    }
    writeInt16(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.int16);
        this.m_data.writeInt16BE(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int16;
        this.m_valid_pos = this.m_pos;
    }
    writeUInt16(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.int16);
        this.m_data.writeUInt16BE(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int16;
        this.m_valid_pos = this.m_pos;
    }
    writeInt32(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.int32);
        this.m_data.writeInt32BE(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int32;
        this.m_valid_pos = this.m_pos;
    }
    writeUInt32(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.int32);
        this.m_data.writeUInt32BE(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int32;
        this.m_valid_pos = this.m_pos;
    }
    writeInt64(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.int64);
        const sign = paramValue < 0;
        if (sign) {
            const v = Math.abs(paramValue);
            const low = v % 0x100000000;
            const high = -((v - low) / 0x100000000);
            this.writeInt32(high);
            this.writeUInt32(low);
        }
        else {
            const v = paramValue;
            const low = v % 0x100000000;
            const high = (v - low) / 0x100000000;
            this.writeInt32(high);
            this.writeUInt32(low);
        }
    }
    writeFloat(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.float);
        this.m_data.writeFloatBE(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.float;
        this.m_valid_pos = this.m_pos;
    }
    writeDouble(paramValue) {
        this.ensureCapacity(this.m_pos + xbuffer_const_1.EnumBufferSize.double);
        this.m_data.writeDoubleBE(paramValue, this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.double;
        this.m_valid_pos = this.m_pos;
    }
    writeBuffer(paramBuffer, paramBytes) {
        const bytes = Number.isSafeInteger(paramBytes) ? paramBytes : paramBuffer.length;
        this.ensureCapacity(this.m_pos + bytes);
        paramBuffer.copy(this.m_data, this.m_pos, 0, bytes);
        this.m_pos += bytes;
        this.m_valid_pos = this.m_pos;
    }
    writePackBuffer(paramBuffer) {
        if (!Buffer.isBuffer(paramBuffer)) {
            return;
        }
        this.ensureCapacity(this.m_pos + paramBuffer.length);
        this.writeInt32(paramBuffer.length);
        this.writeBuffer(paramBuffer);
    }
    writeString(paramString, paramEncoding = 'utf8') {
        this.writePackBuffer(Buffer.from(paramString, paramEncoding));
    }
    getBufferData() {
        return this.m_data.slice(0, this.m_pos);
    }
}
exports.XPackageWriter = XPackageWriter;
/**
 * 一个针对数据包专门封装的类
 * - 这里使用的方法，都是基于BE的方式，如果使用LE的方式，需要重新改一下
 */
class XPackageReader extends XBuffer {
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    constructor(paramCapacity, paramFillByte) {
        super(paramCapacity, paramFillByte);
    }
    isCanRead(paramBytes) {
        if (!Number.isSafeInteger(paramBytes)) {
            return false;
        }
        if (paramBytes < 1) {
            return false;
        }
        return (this.m_pos + paramBytes) <= this.m_valid_pos;
    }
    /** 是否可读写8位整数 */
    isCanReadInt8() {
        return this.isCanRead(xbuffer_const_1.EnumBufferSize.int8);
    }
    /** 是否可读写16位整数 */
    isCanReadInt16() {
        return this.isCanRead(xbuffer_const_1.EnumBufferSize.int16);
    }
    /** 是否可读写32位整数 */
    isCanReadInt32() {
        return this.isCanRead(xbuffer_const_1.EnumBufferSize.int32);
    }
    /** 是否可读写64位整数 */
    isCanReadInt64() {
        return this.isCanRead(xbuffer_const_1.EnumBufferSize.int64);
    }
    /** 是否可读写单精度浮点数 */
    isCanReadFloat() {
        return this.isCanRead(xbuffer_const_1.EnumBufferSize.float);
    }
    /** 是否可读写双精度浮点数 */
    isCanReadDoublie() {
        return this.isCanRead(xbuffer_const_1.EnumBufferSize.double);
    }
    /**
     * 删除指定的字节数的数据
     * - 这块数据实际是是已经读取的后的包数据，空出位置用于接收新数据
     */
    removeData(paramBytes) {
        let ret = xbuffer_const_1.EnumErrBuffer.OK;
        do {
            if (!Number.isSafeInteger(paramBytes)) {
                // 传入参数不是安全的整数
                ret = xbuffer_const_1.EnumErrBuffer.INVALID_BYTES_BY_DEL;
                break;
            }
            if (paramBytes <= 0) {
                // 要删除的字节数<=0 至少要删除一个字节
                ret = xbuffer_const_1.EnumErrBuffer.INVALID_BYTES_BY_DEL;
                break;
            }
            if (paramBytes > this.m_pos) {
                // 要删除的字节数，不能大于已经已经读取的字节数
                ret = xbuffer_const_1.EnumErrBuffer.INVALID_BYTES_BY_DEL;
                break;
            }
            this.m_data.copy(this.m_data, 0, this.m_pos, this.m_valid_pos);
            this.m_pos -= paramBytes;
            this.m_valid_pos -= paramBytes;
            // eslint-disable-next-line no-constant-condition
        } while (false);
        return ret;
    }
    /** 追加数据 */
    appendData(paramData, paramStartPos, paramEndPos) {
        let ret = xbuffer_const_1.EnumErrBuffer.OK;
        do {
            if (!Buffer.isBuffer(paramData)) {
                ret = xbuffer_const_1.EnumErrBuffer.DATA_IS_NOT_BUFFER;
                break;
            }
            const byteCount = paramData.length;
            const startPos = Number.isSafeInteger(paramStartPos) ? paramStartPos : 0;
            const endPos = Number.isSafeInteger(paramEndPos) ? paramEndPos : byteCount;
            if (endPos < startPos || startPos < 0) {
                // 如果要读取的pos超出范围
                ret = xbuffer_const_1.EnumErrBuffer.OUT_OF_POS;
                break;
            }
            // 如果已经超出有效的字节数
            if (startPos >= byteCount) {
                ret = xbuffer_const_1.EnumErrBuffer.OUT_OF_POS;
                break;
            }
            if (startPos === endPos) {
                break;
            }
            // 如果没有可以读取的字节数
            const readBytes = endPos - startPos;
            if (readBytes <= 0) {
                break;
            }
            // 检查容量，是否足够
            const minCapacity = this.m_valid_pos + readBytes;
            ret = this.ensureCapacity(minCapacity);
            if (ret !== xbuffer_const_1.EnumErrBuffer.OK) {
                break;
            }
            // 复制数据
            const copiedBytes = paramData.copy(this.m_data, this.m_valid_pos, startPos, endPos);
            if (copiedBytes > 0) {
                this.m_valid_pos += copiedBytes;
            }
        } while (false);
        return ret;
    }
    readFloat() {
        const ret = this.m_data.readFloatBE(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.float;
        return ret;
    }
    readDouble() {
        const ret = this.m_data.readDoubleBE(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.double;
        return ret;
    }
    readBuffer(paramBytes) {
        let ret = xbuffer_const_1.EnumErrBuffer.OK;
        let data = null;
        do {
            if (!Number.isSafeInteger(paramBytes)) {
                ret = xbuffer_const_1.EnumErrBuffer.PARAM_IS_NOT_SAFE_INT;
                break;
            }
            if (paramBytes < 1) {
                ret = xbuffer_const_1.EnumErrBuffer.READ_BYTES_LE_ONE;
                break;
            }
            if (!this.isCanRead(paramBytes)) {
                ret = xbuffer_const_1.EnumErrBuffer.READ_BYTES_NOT_ENOUGH;
                break;
            }
            data = Buffer.allocUnsafe(paramBytes);
            this.m_data.copy(data, 0, this.m_pos, this.m_pos + paramBytes);
            this.m_pos += paramBytes;
        } while (false);
        return { ret, data };
    }
    readPackBuffer() {
        const bytes = this.readInt32();
        return this.readBuffer(bytes);
    }
    readInt8() {
        const ret = this.m_data.readInt8(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int8;
        return ret;
    }
    readUInt8() {
        const ret = this.m_data.readUInt8(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int8;
        return ret;
    }
    readInt16() {
        const ret = this.m_data.readInt16BE(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int16;
        return ret;
    }
    readUInt16() {
        const ret = this.m_data.readUInt16BE(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int16;
        return ret;
    }
    readInt32() {
        const ret = this.m_data.readInt32BE(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int32;
        return ret;
    }
    readUInt32() {
        const ret = this.m_data.readUInt32BE(this.m_pos);
        this.m_pos += xbuffer_const_1.EnumBufferSize.int32;
        return ret;
    }
    readInt64() {
        const high = this.readInt32();
        const low = this.readUInt32();
        const sign = high < 0;
        if (sign) {
            return -(Math.abs(high) * 0x100000000 + low);
        }
        else {
            return high * 0x100000000 + low;
        }
    }
    readString(paramEncoding = 'utf8') {
        const r = this.readPackBuffer();
        let str = null;
        let ret = r.ret;
        if (r.ret === xbuffer_const_1.EnumErrBuffer.OK) {
            ret = r.ret;
            str = r.data.toString(paramEncoding);
        }
        return { ret, str };
    }
}
exports.XPackageReader = XPackageReader;
