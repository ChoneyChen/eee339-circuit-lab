# Lecture 8–15 内容与来源审计

审计对象：`js/lessons-late.js`。按原始 PDF 的物理页码逐页阅读了 5 份课件、共 159 页；文本取自 `content/source-text`。以下页码不是网页自定义页码，也不是课件内偶有错位的“见 slide …”交叉引用。

当前内容有 7 个可用教学单元、53 个知识节、159 段中文正文、63 道练习，其中 15 道为限定组合 Verilog 的编程/纠错题，参考解覆盖 578 个输入向量；另有每节各 1 个理解检查。Lecture 10 明确缺失，不编造内容。

## 合并课件如何拆分

- `Lecture12-13_v3.pdf` 共 36 页。网页 Lecture 12 按主题承接第 3–15 页 ASM/编码/实现；Lecture 13 承接第 16–36 页总线交换及练习。第 1–2 页的共同封面与学习目标由两讲元数据/导读覆盖，第 35–36 页总结也跨两讲复习。原文件没有独立讲次分隔页，网页已明确披露这是主题拆分。
- `Lecture14-15.pdf` 共 38 页。网页 Lecture 14 按主题承接第 3–20 页体系结构和指令周期；Lecture 15 承接第 21–38 页性能。第 1–2 页为共用封面/目标。`sourcePages` 保留原文件总页数，不把子范围伪装成独立 PDF。

## Lecture08.pdf：19 页

| 原页 | 原页内容 | 网页映射 |
|---|---|---|
| 1 | 封面、讲次与授课信息 | Lecture 8 标题、来源元数据 |
| 2 | 本次目标：加法器、溢出 | summary、objectives |
| 3 | HDL 全课程路线图 | summary、objectives；`l8-half` 的模块复用引入 |
| 4 | 图像化路线图：半/全加器、串行进位、generate、不同描述、溢出、BCD | `l8-half`、`l8-ripple`、`l8-generate`、`l8-behavior`、`l8-overflow`、`l8-bcd` |
| 5 | 半加器真值表、XOR 与 AND 门 | `l8-half`；练习 e1 |
| 6 | 全加器真值表、carry 多数逻辑代数 | `l8-full`；e3 的全 8 向量 |
| 7 | XOR 结合律代数推导 | `l8-full`；e2 |
| 8 | 全加器 XOR/AND/OR 门图 | `l8-full` 的硬件映射 |
| 9 | 多输入 XOR 奇数个 1 的含义 | `l8-full` |
| 10 | 无符号与补码范围、四组溢出实例 | `l8-overflow`；e7 |
| 11 | c3 XOR c4 与符号位等价推导 | `l8-overflow`、`l8-behavior`；e5 |
| 12 | assign 版全加器 | `l8-full`；e3 |
| 13 | 四级例化与进位连线 | `l8-ripple` |
| 14 | generate / genvar 说明 | `l8-generate`；e4 |
| 15 | 参数化 n 位例化与实例层次名 | `l8-generate` |
| 16 | always+for 的 n 位加法器 | `l8-generate`、`l8-behavior` |
| 17 | 行为加法、宽结果、overflow | `l8-behavior`；e6 |
| 18 | BCD 修正加 6，7+5、8+9 例子 | `l8-bcd`；e8 全 200 个合法 BCD 组合 |
| 19 | 总结及结构/行为等价边界 | 各节复习，尤其 `l8-behavior`、`l8-bcd` |

视觉核查：渲染并检查第 4、5、6、7、8、11 页。第 4 页几乎只有图，第 6–8 页有真值表/公式/门图，文本提取明显缺内容，已按图补齐；没有把图中乘积项错读成无反相的重复项。

## Lecture09.pdf：37 页

| 原页 | 原页内容 | 网页映射 |
|---|---|---|
| 1 | 封面 | Lecture 9 元数据 |
| 2 | 学习目标和五部分路线 | summary、objectives |
| 3 | 组合与时序、反馈存储结构 | `l9-storage` |
| 4 | Gated D latch、透明/保持波形 | `l9-storage`；e1 |
| 5 | DFF、posedge、采样波形 | `l9-storage` |
| 6 | latch 与 DFF 同刺激比较 | `l9-storage` |
| 7 | 意外 latch、两种修复 | `l9-latch`；e7 |
| 8 | 异步/同步复位波形 | `l9-reset` |
| 9 | 复位极性、敏感表、释放时序 | `l9-reset`；e2 |
| 10 | 带使能 DFF、反馈 MUX | `l9-reset` |
| 11 | setup、hold、clock-to-Q | `l9-timing`；e8 |
| 12 | = 与 <= 的调度差异 | `l9-assignment`；e3 |
| 13 | 决定存储的不是赋值运算符 | `l9-assignment` |
| 14 | 两级 Q1/Q2 逐句追踪 | `l9-assignment` |
| 15 | 同 D 输入与真正串接 DFF 的门图 | `l9-assignment` |
| 16 | 两种赋值的波形差异 | `l9-assignment` |
| 17 | Example 7.5：阻塞 f/g | `l9-dataflow` |
| 18 | Example 7.6：非阻塞 f/g | `l9-dataflow` |
| 19 | Example 7.5/7.6 波形 | `l9-dataflow` |
| 20 | 两寄存器交换，3/7 示例 | `l9-dataflow`；e4 |
| 21 | 过程赋值约定、单写入块 | `l9-assignment` |
| 22 | n 位寄存器、复制表达式、使能 | `l9-shift` |
| 23 | 4 位移位及逐边沿表格 | `l9-shift` |
| 24 | for 与拼接等价，右/左/循环移位 | `l9-shift`；e5 |
| 25 | SIPO、PISO、延迟线 | `l9-shift` |
| 26 | 4 位加计数及 15→0 | `l9-counter` |
| 27 | 减计数、加减计数、加载优先级 | `l9-counter` |
| 28 | 模 N / BCD、比较 N−1 | `l9-counter`；e6 |
| 29 | tc 与十进制级联，共享 Clock | `l9-counter`；e10 |
| 30 | 计数器 testbench、初始化时钟与刺激 | `l9-testbench` |
| 31 | 22/32/82/102ns 与实际计数边沿 | `l9-testbench`；e9 |
| 32 | HDLBits Dff8r/Dff8ar 题目 | `l9-reset`、`l9-testbench` |
| 33 | Shift4/Count10 题目 | `l9-shift`、`l9-counter` |
| 34 | 同步与异步复位解答 | `l9-reset` |
| 35 | Shift4/Count10 解答与优先级 | `l9-shift`、`l9-counter` |
| 36 | 六类常见错误 | `l9-latch`、`l9-reset`、`l9-assignment`、`l9-counter`、`l9-testbench` |
| 37 | 总结、setup/hold 路径公式、课后作业 | `l9-timing` 及各节复习；`l9-testbench` 课后入口 |

视觉核查：渲染第 6、15、31 页，核对透明区、Q2 的 D 线来源、五个实际计数边沿。setup/hold 公式补充说明忽略偏斜的简化前提，浏览器二值示意不模拟亚稳态。

## Lecture 10：缺失

当前工作目录没有 `Lecture10.pdf`，也没有对应 source-text。`lesson10.available=false`、`sourcePages=0`、无知识节与练习。预留结构只说明如何日后更新，不从其他讲次猜测其主题。

## Lecture11.pdf：29 页

| 原页 | 原页内容 | 网页映射 |
|---|---|---|
| 1 | 封面 | Lecture 11 元数据 |
| 2 | 学习目标 | summary、objectives |
| 3 | 通用时序结构、Moore/Mealy 输出依赖 | `l11-flow` |
| 4 | 六步 FSM 设计流程 | `l11-flow` |
| 5 | 两个连续 1 检测规格、输入输出序列 | `l11-moore` |
| 6 | Moore A/B/C 状态图与含义 | `l11-moore`；e1、e2 |
| 7 | 最少历史记忆、逐周期状态 | `l11-moore` |
| 8 | Moore 状态表 | `l11-moore`、`l11-equations` |
| 9 | 二进制编码，现态 y 与次态 Y | `l11-equations` |
| 10 | Y1/Y2/z 逐列方程，非法码无关项 | `l11-equations` |
| 11 | 两 DFF 与组合反馈门图 | `l11-equations` |
| 12 | Moore 波形 | `l11-mealy` 的时刻比较 |
| 13 | Mealy 同周期规格与对照序列 | `l11-mealy` |
| 14 | 两态 Mealy 图、表、Y=w,z=w&y | `l11-mealy`；e4 |
| 15 | Mealy 电路与输入穿透波形 | `l11-mealy`；e5 |
| 16 | Moore/Mealy 比较表 | `l11-mealy`；e8 的物理边界 |
| 17 | 注册 Mealy 输出及延迟 | `l11-mealy` |
| 18 | 标准三部分模板 | `l11-template`；e3 |
| 19 | 三部分 Moore 教材代码含 xx 默认 | `l11-template`、`l11-default` |
| 20 | 小 FSM 两部分写法 | `l11-template` |
| 21 | localparam、默认回 A、全路径、复位 | `l11-default`；e6 |
| 22 | Mealy 代码与默认值 | `l11-default` |
| 23 | defaults-first 避免 latch | `l11-default` |
| 24 | assign、组合 case、注册输出三种方式 | `l11-output`；e7 |
| 25 | 序列 testbench、[0:10] 与下降沿刺激 | `l11-testing`；e9 |
| 26 | Moore/Mealy 波形 | `l11-mealy`、`l11-testing` |
| 27 | FSM 常见错误 | `l11-default`、`l11-testing` |
| 28 | 总结 | 各节复习 |
| 29 | ASM/one-hot 前瞻、HDLBits Fsm1/Fsm2 | `l11-testing` 课后衔接 |

视觉核查：渲染第 11、26 页，核对 Y/y 的反馈与两个模型输出相位。解释 Moore 在边沿后进入 C 的具体语义，不把“迟一周期”脱离输入更新时间当成绝对规则。

## Lecture12-13_v3.pdf：36 页

| 原页 | 原页内容 | 网页映射 |
|---|---|---|
| 1 | 合并课件封面 | Lecture 12/13 共用来源声明 |
| 2 | 共同目标与路线 | 两讲 summary、objectives |
| 3 | 状态图到 ASM 的对应 | `l12-meaning` |
| 4 | C 框逐标号读图 | `l12-meaning` |
| 5 | ASM 的作用与一状态一周期 | `l12-meaning` |
| 6 | 哪些复杂控制器适用 | `l12-meaning` |
| 7 | 状态/判断/条件输出三符号 | `l12-symbols`；e2 |
| 8 | 判断不占独立周期、多输入完整出口 | `l12-time`；e1、e7 |
| 9 | 测试是门电路而非软件指令 | `l12-time` |
| 10 | 二进制、Gray 风格、one-hot 编码表 | `l12-encoding`；e3 |
| 11 | P/Q/R 图与 CMD1/CMD2 条件输出 | `l12-symbols`、`l12-equations`；e6 |
| 12 | 图到二进制状态表 | `l12-equations`；e4 |
| 13 | D(A)、D(B)、CMD 方程 | `l12-equations`；e8 |
| 14 | 二进制门图 | `l12-equations` |
| 15 | ASM 到三部分 Verilog | `l12-verilog` |
| 16 | 共享总线、驱动互斥 | `l13-bus`；e1 |
| 17 | 每位寄存器的 Rin/Rout 与三态 | `l13-bus`；e7 |
| 18 | 三步交换 R2→R3、R1→R2、R3→R1 | `l13-swap`；e2 |
| 19 | 脉冲移位序列器、单拍 w 要求 | `l13-sequencer`；e3 |
| 20 | 交换 ASM 与原移位器协议差异 | `l13-sequencer` |
| 21 | regn/trin/shiftr/swap 模块组成 | `l13-modules` |
| 22 | regn 与 trin 模块 | `l13-modules` |
| 23 | shiftr 模块与 [1:m] 位序 | `l13-sequencer` |
| 24 | 顶层 swap 连接、外部加载 | `l13-modules` |
| 25 | 状态→控制→数据，周期结束写回 | `l13-waveform`；e6 |
| 26 | MUX 总线替代内部三态 | `l13-mux` |
| 27 | swapmux 代码与选择映射 | `l13-mux`；e4 |
| 28 | 外部加载 55/AA 波形 | `l13-waveform` |
| 29 | 三步交换波形 | `l13-waveform` |
| 30 | 三态与 MUX 总线比较 | `l13-mux` |
| 31 | 教材模块化结构与命名 FSM 比较 | `l13-clean` |
| 32 | clean 控制器与 done=T3 | `l13-clean`；e5、e8、e9 |
| 33 | clean 总线/寄存器状态动作 | `l13-clean` |
| 34 | HDLBits Fsm1/Fsm2 规格 | `l13-practice` |
| 35 | ASM/编码/总线/交换总结 | Lecture 12 各节与 `l13-practice` |
| 36 | Fsm3 系列、长 w 测试、自检 | `l13-practice`；`l12-equations` 补推 one-hot 入边方程与 e5 |

视觉核查：渲染第 11、17、25、29 页。核对圆角条件 CMD2 只属于 P,Z=0 路径；Rin 的反馈 MUX；目标寄存器在结束当前控制周期的边沿写入。one-hot P/Q/R 方程是从原图推导的教学展开，不冒称课件另有该完整代码页。

## Lecture14-15.pdf：38 页

| 原页 | 原页内容 | 网页映射 |
|---|---|---|
| 1 | 合并课件封面 | Lecture 14/15 共用来源声明 |
| 2 | 共同目标 | 两讲 summary、objectives |
| 3 | 交换系统到 CPU：控制/数据通路/存储 | `l14-bridge` |
| 4 | 后续 CPU 路线与已有基础 | `l14-bridge` |
| 5 | 架构、前端、后端、制造角色 | `l14-terms` |
| 6 | CPU/GPU/NPU/TPU/SoC | `l14-terms` |
| 7 | 位宽、工艺、核心、发射宽度 | `l14-terms`；e2 |
| 8 | ISA 与组织 | `l14-isa`；e1 |
| 9 | C→汇编→机器码、MIPS add 字段 | `l14-machine`；e3 |
| 10 | 相邻数组交换、lw/sw 四条机器码 | `l14-machine`；e4 |
| 11 | 高级语言、可移植性 | `l14-software`；e9 |
| 12 | 应用/库/系统软件/硬件 | `l14-software` |
| 13 | ISA 五类规定 | `l14-isa` |
| 14 | ISA 作为接口、不同实现 | `l14-isa` |
| 15 | RISC/CISC 教学比较、MIPS 前提 | `l14-isa` |
| 16 | 抽象层隐藏细节 | `l14-software` |
| 17 | 接口与实现、MUX、Verilog 端口 | `l14-interface`；e7 |
| 18 | 五大部件 | `l14-components`；e6 |
| 19 | control/datapath 比较 | `l14-components` |
| 20 | lw 指令周期、PC+4、可对应 ASM | `l14-components`；e5、e8 |
| 21 | 飞机多种性能指标 | `l15-metric` |
| 22 | 响应时间与吞吐 | `l15-metric`；e10 |
| 23 | 性能倒数、10s/15s 比值 | `l15-metric`；e1 |
| 24 | elapsed 与 user/system CPU time | `l15-metric` |
| 25 | 周期/频率、250ps 与 4GHz | `l15-clock`；e2 |
| 26 | CPU 周期数×周期时间 | `l15-clock` |
| 27 | B 多1.2倍周期但要6s，求4GHz | `l15-clock` |
| 28 | IC/CPI/Tc 定义与总公式 | `l15-equation`；e3 |
| 29 | 同指令流 A/B CPI/周期比较 | `l15-equation`；e5 |
| 30 | 按指令混合加权 CPI，1.7 例 | `l15-mix`；e4 |
| 31 | 两代码序列 5条10周期/6条9周期 | `l15-mix`；e6 |
| 32 | 三因素及影响来源 | `l15-factors`；e9 |
| 33 | Amdahl 80/20 例 | `l15-amdahl` |
| 34 | Amdahl 曲线与不可超越上限 | `l15-amdahl`；e7 |
| 35 | MIPS 公式与更高却更慢反例 | `l15-mips`；e8 |
| 36 | 六类常见错误与单位 | `l15-review` |
| 37 | 架构/抽象/组成/性能总结 | 两讲各节与 `l15-review` |
| 38 | 三个计算题、阅读与 ISA 回顾 | `l15-review`；`l14-machine` 字段复习 |

视觉核查：渲染第 9、20、34 页，核对指令字段边界、lw 六步中的目的寄存器与 PC 间距、Amdahl 的两条上限曲线。重算源材料所有性能例题与 MIPS 反例。

## 明确的纠正、补充与边界

1. **carry 不等于 signed overflow**：Lecture 8 分开解释两类范围和检测；对 BCD 另外定义十进制 carry。先扩位再加法，避免参考解依赖隐含截断规则。
2. **= 不等于组合、<= 不等于一定有 DFF**：按照 Lecture 9 第 13 页解释敏感事件与保持要求，再说明工程约定。非阻塞在当前时间步 NBA 更新，不是等下一个时钟。
3. **Moore“无毛刺”是理想模型简化**：源 Lecture 11 第 16 页把 Moore 概括为 glitch-free。网页补充多位状态组合译码可能因物理门延迟毛刺，严格稳定控制宜注册。
4. **one cycle earlier 需固定观察时刻**：用第一个/第二个采样边沿、输入所在周期说明 Moore/Mealy，防止把标签差异误作绝对延迟定律。
5. **教材 xx 默认不是安全恢复**：保留其作为阅读风险的说明，实际完整模板使用回到起始态的确定值；don’t care 简化只保证合法态函数。
6. **one-hot 的合法态前提**：P/Q/R 用恰好一位为 1；交换三位序列器另把全 0 当 Idle，明确两种编码约定不同。
7. **shift controller 与 ASM 协议不同**：前者每拍接收 w，后者仅 Idle 接收。MUX 消除了多驱动电气冲突，不会自动消除非法多 1 的多装载错误。
8. **数据寄存器并未自动复位**：原 regn 无 reset，图例初值不能当作代码保证；先加载再使用。改良 FSM 外部装载仅空闲有效。
9. **start 与 done 有准确时序**：start 忙时忽略，但持续到回 Idle 可再启动；done=T3 是最后一步正在进行，最后 R1 写回发生在结束 T3 的边沿。
10. **RISC/CISC 表是教学近似**：说明 RISC 不普遍保证固定长度或一周期完成；同 ISA 的兼容还涉及扩展/ABI/运行环境。32/64 位与指令长度独立。
11. **同 ISA 不足以保证 IC 相等**：比较例题采用同一动态指令流；不同编译结果仍可能有不同 IC。程序性能必须按固定工作和完整三因素比较。
12. **CPU 与公式电路范围**：字段切片、地址加法、统计周期电路是局部组合练习，没有被描述为完整处理器、真实 benchmark 或静态时序分析。

## 自动题与验证

- 15 道代码/纠错题全部是单模块 continuous `assign` 组合子集；时序/FSM 题只把 current state 作为显式输入，检查 next/output 函数。
- 完整时序模板用于阅读与概念练习，明确没有通过浏览器组合引擎验证事件调度、复位释放、亚稳态或 x/z 竞争。
- 每道编程题具有完整输入/输出端口、位宽、期望向量、参考解、中文解释、提示，sectionId 均指向本课具体节。
- 本文件范围内 schema 检查通过：53 节均有 3 段正文与有效理解检查；63 题的节关联和选择答案索引有效。
- 引擎代理已执行整个站点的 `npm run check` 与 `npm test`：40 道组合题 / 858 向量通过（包含本文件 15 道 / 578 向量）；各 starter 均未误判为完成。这里记录的是全站验证与本文件子集，避免把两个统计混为一谈。
