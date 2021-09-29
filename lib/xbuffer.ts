/**
 * 这里实现了消息包拼包，需要的buffer读写类
 */
import { constants } from 'buffer';
import { CAPACITY_BLOCK_SIZE, DEFAULT_CAPACITY, EnumBufferSize, EnumErrBuffer } from './xbuffer_const';

/**
 * 是这一个基于Buffer之上的扩展buffer, 主要用于动态扩展buffer空间，预分配空间等
 */
export class XBuffer {
    /** 当前的数据区 */
    protected m_data: Buffer;
    /** 当前的位置 */
    protected m_pos = 0;
    /**
     * 最后用效的位置 m_valid_Pos >= m_pos
     * - 在writeBuffer这m_valid_Pos是无效的
     */
    protected m_valid_pos = 0;
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    public constructor(paramCapacity ?: number, paramFillByte ?: number) {
        let cap = DEFAULT_CAPACITY;
        if (Number.isSafeInteger(paramCapacity)) {
            cap = paramCapacity as number;
        }
        if (XBuffer.checkFillByte(paramFillByte)) {
            this.m_data = Buffer.alloc(cap, paramFillByte);
        } else {
            this.m_data = Buffer.allocUnsafe(cap);
        }
    }
    /**
     * 检查是否是有效的填充字节
     * @param paramFillByte 填充的字节，只支待0-255的数字
     *  - true 表示是有效的填充字节
     *  - false 表示不是有效的填充字节
     */
    public static checkFillByte(paramFillByte ?: number): boolean {
        if (!Number.isSafeInteger(paramFillByte)) {
            return false;
        }
        return (paramFillByte as number)>= 0 && (paramFillByte as number)<= 255;
    }

    /**
     * 确定容量
     * @param paramCapacity 确的容量
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    public ensureCapacity(paramCapacity: number, paramFillByte ?: number): EnumErrBuffer {
        if ((!Number.isSafeInteger(paramCapacity) || paramCapacity < 0)) {
            return EnumErrBuffer.INVALID_CAPACITY_VALUE;
        }
        if (this.capacity >= paramCapacity) {
            return EnumErrBuffer.OK;
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
    private expandCapacity(paramMinCapacity: number, paramFillByte ?: number): EnumErrBuffer {
        const nowCapacity = this.capacity;
        // 如果当前空量满足要求，
        if (nowCapacity >= paramMinCapacity) {
            return EnumErrBuffer.OK;
        }
        // 如果超出最大容量
        if (paramMinCapacity > constants.MAX_LENGTH) {
            return EnumErrBuffer.OUT_OF_MAX;
        }

        const doubleNowCapacity = nowCapacity * 2;
        let newCapacity = paramMinCapacity;
        if (newCapacity < doubleNowCapacity) {
            newCapacity =  doubleNowCapacity;
        }
        // 将容量设为指定块的整数倍
        const mod = newCapacity % CAPACITY_BLOCK_SIZE;
        if (mod > 0) {
            newCapacity += (CAPACITY_BLOCK_SIZE - mod);
        }
        // 如果计算出来的容量，大于最大容量, 则将容量设为最大容量
        if (newCapacity > constants.MAX_LENGTH) {
            newCapacity = constants.MAX_LENGTH;
        }

        const old_data = this.m_data;
        try {
            const new_data = XBuffer.checkFillByte(paramFillByte)? Buffer.alloc(newCapacity, paramFillByte):Buffer.allocUnsafe(newCapacity);
            this.m_data = new_data;
        }catch(e) {
            return EnumErrBuffer.ALLOC_BUFFER_FAIL;
        }

        const endPos = this.m_valid_pos;
        if (endPos > 0) {
            // 复制有效数据
            old_data.copy(this.m_data, 0, 0, endPos);
        }
        return EnumErrBuffer.OK;
    }
    /**
     * 当前容量
     */
    public get capacity(): number {
        return this.m_data.length;
    }
    /** 当前位置 */
    public get pos(): number {
        return this.m_pos;
    }
    /** 当前的数据 */
    public get data(): Buffer {
        return this.m_data;
    }
    public get_valid_pos(): number {
        return this.m_valid_pos;
    }

    /**
     * 设置新位置，会做检查
     * @param paramNewPos 新位置，位置范围是[0,capacity)
     * @return 设置结果
     *  - 0 表示设置成功
     *  - 其它值，表示设置错误
     */
    public setPos(paramNewPos: number): EnumErrBuffer {
        if (!Number.isSafeInteger(paramNewPos)) {
            return EnumErrBuffer.INVALID_NEW_POS;
        }
        if (paramNewPos < 0 || paramNewPos>= this.capacity) {
            return EnumErrBuffer.OUT_OF_POS;
        }

        this.m_pos = paramNewPos;
        return EnumErrBuffer.OK;
    }

    /**
     * 设置新位置
     * - 不做检查，请确保新位置是整数，且范围是[0,capacity)
     * - 对于已知的操作，减少检查，来提高性能
     * @param paramNewPos 新位置
     */
    public setPosUncheck(paramNewPos: number): void {
        this.m_pos = paramNewPos;
    }

    public toJSON(): { data: Buffer, pos: number, capacity: number, valid_pos: number } {
        return {
            capacity : this.capacity,
            pos      : this.m_pos,
            valid_pos: this.m_valid_pos,
            data     : this.m_data
        };
    }
}

export class XPackageWriter extends XBuffer {
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    public constructor(paramCapacity ?: number, paramFillByte ?: number){
        super(paramCapacity, paramFillByte);
    }

    public isCanWrite(paramBytes: number): boolean {
        if (!Number.isSafeInteger(paramBytes)) {
            return false;
        }
        if (paramBytes < 1) {
            return false;
        }
        return (this.m_pos + paramBytes) <= this.capacity;
    }

    /** 是否可读写8位整数 */
    public isCanWriteInt8(): boolean {
        return this.isCanWrite(EnumBufferSize.int8);
    }
    /** 是否可读写16位整数 */
    public isCanWriteInt16(): boolean {
        return this.isCanWrite(EnumBufferSize.int16);
    }
    /** 是否可读写32位整数 */
    public isCanWriteInt32(): boolean {
        return this.isCanWrite(EnumBufferSize.int32);
    }
    /** 是否可读写64位整数 */
    public isCanWriteInt64(): boolean {
        return this.isCanWrite(EnumBufferSize.int64);
    }
    /** 是否可读写单精度浮点数 */
    public isCanWriteFloat(): boolean {
        return this.isCanWrite(EnumBufferSize.float);
    }
    /** 是否可读写双精度浮点数 */
    public isCanWriteDoublie(): boolean {
        return this.isCanWrite(EnumBufferSize.double);
    }

    public writeInt8(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.int8);
        this.m_data.writeInt8(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.int8;
        this.m_valid_pos = this.m_pos;
    }
    public writeUInt8(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.int8);
        this.m_data.writeUInt8(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.int8;
        this.m_valid_pos = this.m_pos;
    }

    public writeInt16(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.int16);
        this.m_data.writeInt16BE(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.int16;
        this.m_valid_pos = this.m_pos;
    }
    public writeUInt16(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.int16);
        this.m_data.writeUInt16BE(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.int16;
        this.m_valid_pos = this.m_pos;
    }

    public writeInt32(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.int32);
        this.m_data.writeInt32BE(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.int32;
        this.m_valid_pos = this.m_pos;
    }

    public writeUInt32(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.int32);
        this.m_data.writeUInt32BE(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.int32;
        this.m_valid_pos = this.m_pos;
    }

    public writeInt64(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.int64);
        const sign = paramValue < 0;
        if (sign) {
            const v = Math.abs(paramValue);
            const low = v % 0x100000000;
            const high = -((v - low) / 0x100000000);
            this.writeInt32(high);
            this.writeUInt32(low);
        } else {
            const v= paramValue;
            const low = v % 0x100000000;
            const high = (v - low) / 0x100000000;
            this.writeInt32(high);
            this.writeUInt32(low);
        }
    }

    public writeFloat(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.float);
        this.m_data.writeFloatBE(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.float;
        this.m_valid_pos = this.m_pos;
    }


    public writeDouble(paramValue: number): void {
        this.ensureCapacity(this.m_pos + EnumBufferSize.double);
        this.m_data.writeDoubleBE(paramValue, this.m_pos);
        this.m_pos += EnumBufferSize.double;
        this.m_valid_pos = this.m_pos;
    }

    public writeBuffer(paramBuffer: Buffer, paramBytes ?:number): void {
        const bytes = Number.isSafeInteger(paramBytes) ? (paramBytes as number) : paramBuffer.length;
        this.ensureCapacity(this.m_pos + bytes);
        paramBuffer.copy(this.m_data, this.m_pos, 0, bytes);
        this.m_pos += bytes;
        this.m_valid_pos = this.m_pos;
    }

    public writePackBuffer(paramBuffer: Buffer): void {
        if (!Buffer.isBuffer(paramBuffer)) {
            return;
        }
        this.ensureCapacity(this.m_pos + paramBuffer.length);
        this.writeInt32(paramBuffer.length);
        this.writeBuffer(paramBuffer);
    }

    public writeString(paramString: string, paramEncoding: BufferEncoding ='utf8'): void {
        this.writePackBuffer(Buffer.from(paramString, paramEncoding));
    }

    public getBufferData() : Buffer {
        return this.m_data.slice(0, this.m_pos);
    }
}

/**
 * 一个针对数据包专门封装的类
 * - 这里使用的方法，都是基于BE的方式，如果使用LE的方式，需要重新改一下
 */
export class XPackageReader extends XBuffer {
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    public constructor(paramCapacity ?: number, paramFillByte ?: number){
        super(paramCapacity, paramFillByte);
    }

    public isCanRead(paramBytes: number): boolean {
        if (!Number.isSafeInteger(paramBytes)) {
            return false;
        }
        if (paramBytes < 1) {
            return false;
        }
        return (this.m_pos + paramBytes) <= this.m_valid_pos;
    }
    /** 还可以读取的字节数 */
    public get canReadBytes(): number {
        return this.m_valid_pos - this.m_pos;
    }

    /** 是否可读写8位整数 */
    public isCanReadInt8(): boolean {
        return this.isCanRead(EnumBufferSize.int8);
    }
    /** 是否可读写16位整数 */
    public isCanReadInt16(): boolean {
        return this.isCanRead(EnumBufferSize.int16);
    }
    /** 是否可读写32位整数 */
    public isCanReadInt32(): boolean {
        return this.isCanRead(EnumBufferSize.int32);
    }
    /** 是否可读写64位整数 */
    public isCanReadInt64(): boolean {
        return this.isCanRead(EnumBufferSize.int64);
    }
    /** 是否可读写单精度浮点数 */
    public isCanReadFloat(): boolean {
        return this.isCanRead(EnumBufferSize.float);
    }
    /** 是否可读写双精度浮点数 */
    public isCanReadDoublie(): boolean {
        return this.isCanRead(EnumBufferSize.double);
    }
    /**
     * 删除指定的字节数的数据
     * - 这块数据实际是是已经读取的后的包数据，空出位置用于接收新数据
     */
    public removeData(paramBytes: number): EnumErrBuffer {
        let ret = EnumErrBuffer.OK;
        do {
            if (!Number.isSafeInteger(paramBytes)) {
                // 传入参数不是安全的整数
                ret = EnumErrBuffer.INVALID_BYTES_BY_DEL;
                break;
            }
            if (paramBytes <= 0) {
                // 要删除的字节数<=0 至少要删除一个字节
                ret = EnumErrBuffer.INVALID_BYTES_BY_DEL;
                break;
            }

            if (paramBytes > this.m_pos) {
                // 要删除的字节数，不能大于已经已经读取的字节数
                ret = EnumErrBuffer.INVALID_BYTES_BY_DEL;
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
    public appendData(paramData: Buffer, paramStartPos ?: number, paramEndPos ?: number): EnumErrBuffer {
        let ret = EnumErrBuffer.OK;
        do {
            if (!Buffer.isBuffer(paramData)) {
                ret = EnumErrBuffer.DATA_IS_NOT_BUFFER;
                break;
            }
            const byteCount = paramData.length;

            const startPos = Number.isSafeInteger(paramStartPos)? (paramStartPos as number) : 0;
            const endPos   = Number.isSafeInteger(paramEndPos)? (paramEndPos as number): byteCount;
            if (endPos < startPos || startPos < 0) {
                // 如果要读取的pos超出范围
                ret = EnumErrBuffer.OUT_OF_POS;
                break;
            }

            // 如果已经超出有效的字节数
            if (startPos >= byteCount) {
                ret = EnumErrBuffer.OUT_OF_POS;
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
            if(ret !== EnumErrBuffer.OK) {
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

    public readFloat(): number {
        const ret = this.m_data.readFloatBE(this.m_pos);
        this.m_pos += EnumBufferSize.float;
        return ret;
    }

    public readDouble(): number {
        const ret = this.m_data.readDoubleBE(this.m_pos);
        this.m_pos += EnumBufferSize.double;
        return ret;
    }
    /**
     * 读取buffer
     * - 当paramNewCopy为true的时候，表示重新分配一个buffer，然后把数据读到的新的buffer中，多了一个数据复制的过程
     * - 当paramNewCopy不为true的时候，表示直接从当前buffer中slice一个buffer对象出来，但是数据还是原有buffer的数据，少一个数据复制过程
     * @param paramBytes 要读取的字节数
     * @param paramNewCopy 是要创建新的buffer对象复制出来
     * @returns 返回读取结果
     */
    public readBuffer(paramBytes: number, paramNewCopy = true): {ret: EnumErrBuffer, data :Buffer | null } {
        let ret = EnumErrBuffer.OK;
        let data : Buffer | null = null;
        do {
            if (!Number.isSafeInteger(paramBytes)) {
                ret = EnumErrBuffer.PARAM_IS_NOT_SAFE_INT;
                break;
            }

            if (paramBytes < 1) {
                ret = EnumErrBuffer.READ_BYTES_LE_ONE;
                break;
            }

            if (!this.isCanRead(paramBytes)) {
                ret = EnumErrBuffer.READ_BYTES_NOT_ENOUGH;
                break;
            }
            if (paramNewCopy) {
                data = Buffer.allocUnsafe(paramBytes);
                this.m_data.copy(data, 0, this.m_pos, this.m_pos + paramBytes);
            } else {
                data = this.m_data.slice(this.m_pos, this.m_pos + paramBytes);
            }
            this.m_pos += paramBytes;
        } while (false);

        return {ret, data};
    }

    public readPackBuffer(): {ret: EnumErrBuffer, data :Buffer | null } {
        const bytes = this.readInt32();
        return this.readBuffer(bytes);
    }


    public readInt8(): number {
        const ret = this.m_data.readInt8(this.m_pos);
        this.m_pos += EnumBufferSize.int8;
        return ret;
    }

    public readUInt8(): number {
        const ret = this.m_data.readUInt8(this.m_pos);
        this.m_pos += EnumBufferSize.int8;
        return ret;
    }


    public readInt16(): number {
        const ret = this.m_data.readInt16BE(this.m_pos);
        this.m_pos += EnumBufferSize.int16;
        return ret;
    }
    public readUInt16(): number {
        const ret = this.m_data.readUInt16BE(this.m_pos);
        this.m_pos += EnumBufferSize.int16;
        return ret;
    }

    public readInt32(): number {
        const ret = this.m_data.readInt32BE(this.m_pos);
        this.m_pos += EnumBufferSize.int32;
        return ret;
    }
    public readUInt32(): number {
        const ret = this.m_data.readUInt32BE(this.m_pos);
        this.m_pos += EnumBufferSize.int32;
        return ret;
    }
    public readInt64(): number {
        const high = this.readInt32();
        const low  = this.readUInt32();

        const sign = high < 0;
        if (sign) {
            return -(Math.abs(high) * 0x100000000 + low);
        } else {
            return high * 0x100000000 + low;
        }
    }

    public readString(paramEncoding: BufferEncoding ='utf8'): {ret: EnumErrBuffer, str: string | null} {
        const r = this.readPackBuffer();
        let str : string | null = null;
        let ret = r.ret;
        if (r.ret === EnumErrBuffer.OK) {
            ret = r.ret;
            str = (r.data as Buffer).toString(paramEncoding);
        }
        return {ret, str};
    }

}
