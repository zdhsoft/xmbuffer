/// <reference types="node" />
import { EnumErrBuffer } from './xbuffer_const';
/**
 * 是这一个基于Buffer之上的扩展buffer, 主要用于动态扩展buffer空间，预分配空间等
 */
export declare class XBuffer {
    /** 当前的数据区 */
    protected m_data: Buffer;
    /** 当前的位置 */
    protected m_pos: number;
    /**
     * 最后用效的位置 m_valid_Pos >= m_pos
     * - 在writeBuffer这m_valid_Pos是无效的
     */
    protected m_valid_pos: number;
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    constructor(paramCapacity?: number, paramFillByte?: number);
    /**
     * 检查是否是有效的填充字节
     * @param paramFillByte 填充的字节，只支待0-255的数字
     *  - true 表示是有效的填充字节
     *  - false 表示不是有效的填充字节
     */
    static checkFillByte(paramFillByte?: number): boolean;
    /**
     * 确定容量
     * @param paramCapacity 确的容量
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    ensureCapacity(paramCapacity: number, paramFillByte?: number): EnumErrBuffer;
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
    private expandCapacity;
    /**
     * 当前容量
     */
    get capacity(): number;
    /** 当前位置 */
    get pos(): number;
    /** 当前的数据 */
    get data(): Buffer;
    get_valid_pos(): number;
    /**
     * 设置新位置，会做检查
     * @param paramNewPos 新位置，位置范围是[0,capacity)
     * @return 设置结果
     *  - 0 表示设置成功
     *  - 其它值，表示设置错误
     */
    setPos(paramNewPos: number): EnumErrBuffer;
    /**
     * 设置新位置
     * - 不做检查，请确保新位置是整数，且范围是[0,capacity)
     * - 对于已知的操作，减少检查，来提高性能
     * @param paramNewPos 新位置
     */
    setPosUncheck(paramNewPos: number): void;
    toJSON(): {
        data: Buffer;
        pos: number;
        capacity: number;
        valid_pos: number;
    };
}
export declare class XPackageWriter extends XBuffer {
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    constructor(paramCapacity?: number, paramFillByte?: number);
    isCanWrite(paramBytes: number): boolean;
    /** 是否可读写8位整数 */
    isCanWriteInt8(): boolean;
    /** 是否可读写16位整数 */
    isCanWriteInt16(): boolean;
    /** 是否可读写32位整数 */
    isCanWriteInt32(): boolean;
    /** 是否可读写64位整数 */
    isCanWriteInt64(): boolean;
    /** 是否可读写单精度浮点数 */
    isCanWriteFloat(): boolean;
    /** 是否可读写双精度浮点数 */
    isCanWriteDoublie(): boolean;
    writeInt8(paramValue: number): void;
    writeUInt8(paramValue: number): void;
    writeInt16(paramValue: number): void;
    writeUInt16(paramValue: number): void;
    writeInt32(paramValue: number): void;
    writeUInt32(paramValue: number): void;
    writeInt64(paramValue: number): void;
    writeFloat(paramValue: number): void;
    writeDouble(paramValue: number): void;
    writeBuffer(paramBuffer: Buffer, paramBytes?: number): void;
    writePackBuffer(paramBuffer: Buffer): void;
    writeString(paramString: string, paramEncoding?: BufferEncoding): void;
    getBufferData(): Buffer;
}
/**
 * 一个针对数据包专门封装的类
 * - 这里使用的方法，都是基于BE的方式，如果使用LE的方式，需要重新改一下
 */
export declare class XPackageReader extends XBuffer {
    /**
     * 构造函数
     * @param paramCapacity 初始化的容量, 如果不是有效的安全整数，则使用默认值
     * @param paramFillByte 填充的字节，只支待0-255的数字，否则视为没有传入
     */
    constructor(paramCapacity?: number, paramFillByte?: number);
    isCanRead(paramBytes: number): boolean;
    /** 还可以读取的字节数 */
    get canReadBytes(): number;
    /** 是否可读写8位整数 */
    isCanReadInt8(): boolean;
    /** 是否可读写16位整数 */
    isCanReadInt16(): boolean;
    /** 是否可读写32位整数 */
    isCanReadInt32(): boolean;
    /** 是否可读写64位整数 */
    isCanReadInt64(): boolean;
    /** 是否可读写单精度浮点数 */
    isCanReadFloat(): boolean;
    /** 是否可读写双精度浮点数 */
    isCanReadDoublie(): boolean;
    /**
     * 删除指定的字节数的数据
     * - 这块数据实际是是已经读取的后的包数据，空出位置用于接收新数据
     */
    removeData(paramBytes: number): EnumErrBuffer;
    /** 追加数据 */
    appendData(paramData: Buffer, paramStartPos?: number, paramEndPos?: number): EnumErrBuffer;
    readFloat(): number;
    readDouble(): number;
    /**
     * 读取buffer
     * - 当paramNewCopy为true的时候，表示重新分配一个buffer，然后把数据读到的新的buffer中，多了一个数据复制的过程
     * - 当paramNewCopy不为true的时候，表示直接从当前buffer中slice一个buffer对象出来，但是数据还是原有buffer的数据，少一个数据复制过程
     * @param paramBytes 要读取的字节数
     * @param paramNewCopy 是要创建新的buffer对象复制出来
     * @returns 返回读取结果
     */
    readBuffer(paramBytes: number, paramNewCopy?: boolean): {
        ret: EnumErrBuffer;
        data: Buffer | null;
    };
    readPackBuffer(): {
        ret: EnumErrBuffer;
        data: Buffer | null;
    };
    readInt8(): number;
    readUInt8(): number;
    readInt16(): number;
    readUInt16(): number;
    readInt32(): number;
    readUInt32(): number;
    readInt64(): number;
    readString(paramEncoding?: BufferEncoding): {
        ret: EnumErrBuffer;
        str: string | null;
    };
}
