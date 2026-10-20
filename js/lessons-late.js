// Course-grounded Chinese lessons. Source references are original PDF page numbers.
// The browser exercise engine validates the explicitly specified combinational subset only.
const checkpoint = (question, options, answer, explanation) => ({question, options, answer, explanation});
const sec = (id, title, pages, body, code, hardware, pitfalls, check) => ({id,title,pages,body,...(code ? {code} : {}),hardware,pitfalls,check});
const choice = (id,title,sectionId,prompt,options,answer,explanation,hints=[],difficulty=1) => ({id,title,type:'choice',difficulty,sectionId,prompt,options,answer,explanation,hints});
const fill = (id,title,sectionId,prompt,starter,accepted,solution,explanation,hints=[],difficulty=1) => ({id,title,type:'fill',difficulty,sectionId,prompt,starter,accepted,solution,explanation,hints});
const coding = (id,title,sectionId,prompt,starter,solution,inputs,outputs,vectors,explanation,hints=[],difficulty=2,type='code') => ({id,title,type,difficulty,sectionId,prompt,starter,solution,engine:'comb',inputs,outputs,vectors,explanation,hints});
const port = (name,width=1) => ({name,width});
const vec = (inputs,expected) => ({inputs,expected});
const fullAdderVectors = Array.from({length:8},(_,v)=>{const a=(v>>2)&1,b=(v>>1)&1,cin=v&1;return vec({a,b,cin},{sum:(a^b^cin),cout:((a+b+cin)>>1)});});

const lesson8 = {
 id:8,title:'加法器与算术溢出',subtitle:'从 1 位门电路到可扩展加法器，再到 BCD 修正',sourceFile:'Lecture08.pdf',sourcePages:19,available:true,
 summary:'逐页连接半加器、全加器、串行进位、generate、过程描述、二进制溢出与 BCD。把每一条 Verilog 语句追到门、连线、位宽和进位，避免把 carry 与 signed overflow 混为一谈。',
 objectives:['由真值表推导半加器与全加器的两个输出','画出 4 位加法器的进位路径并理解关键路径','区分 generate 展开、过程 for 与行为加法描述','分别判断无符号溢出与补码溢出','用 5 位中间结果完成一位 BCD 加法并检查边界'],
 sections:[
 sec('l8-half','半加器：同一组输入为什么需要两个输出','4–5',[
 '第 4 页用系统图把本课接到模块复用和组合逻辑：小门组成 1 位加法器，1 位模块组成多位加法器。先不要直接写加号，而是把 0+0、0+1、1+0、1+1 四种情况列完。最后一种的数学结果是二进制 10，因此单独一根 sum 线无法表达全部结果，需要再输出一根 carry 线。',
 'sum 只在两个输入不同的时候为 1，所以 sum = a ^ b。carry 只在 a、b 同为 1 的时候为 1，所以 carry = a & b。这两个连续赋值同时存在、同时响应输入；它们不是先算 sum 再算 carry 的软件步骤。输出按 {carry,sum} 拼起来，才是完整的两位结果。',
 '半加器的“半”表示它没有来自低位的输入进位。它适合最低位且 Cin 固定为 0 的情形，也可作为搭建全加器的子块。对照图看硬件：输入 a、b 各自分叉，分别送 XOR 和 AND；这里没有时钟、没有寄存器，也没有任何记忆。'
 ],"module halfadd(input a,b,output sum,carry);\n  assign sum = a ^ b;\n  assign carry = a & b;\nendmodule",'两根输入同时驱动 XOR→sum 和 AND→carry；{carry,sum} 是完整算术结果。',['不要用 OR 代替 XOR：a=b=1 时 sum 应为 0。','只检查 sum 会漏掉 1+1 的进位。'],checkpoint('a=b=1 时，{carry,sum} 是多少？',['00','01','10','11'],2,'1+1=2，即二进制 10：carry=1，sum=0。')),
 sec('l8-full','全加器：奇偶校验负责和，多数判决负责进位','6–9、12',[
 '全加器增加 cin，一共要检查 8 行真值表。sum = a ^ b ^ cin，因为三个输入中 1 的个数为奇数时结果最低位为 1；第 7 页的代数展开说明 XOR 满足结合律，所以 (a ^ b) ^ cin 与 a ^ (b ^ cin) 等价。第 9 页把这个规律推广到多输入 XOR：它给出奇偶性，不是“只允许恰好一个 1”。',
 'cout 为 1 的条件是三根输入中至少两根为 1。课件从乘积项整理得到 (a & b) | (a & cin) | (b & cin)，这就是多数逻辑。第 8 页的电路图是上方 XOR 网络产生 sum，下方三个两输入 AND 与一个 OR 产生 cout；sum 与 cout 的逻辑目标不同。',
 '第 12 页把这张门图写成两个 assign。Cin、x、y 是输入端口，s、Cout 是两根输出线；端口出现的顺序只是接口约定，不是执行先后。比如 1+1+1=3：sum=1、cout=1，因此把 XOR 误写成 OR 有时会恰好通过这一行，仍必须覆盖其余七行。'
 ],"module fulladd(input a,b,cin,output sum,cout);\n  assign sum = a ^ b ^ cin;\n  assign cout = (a & b) | (a & cin) | (b & cin);\nendmodule",'sum 是三输入奇偶性网络；cout 是三输入多数逻辑，二者并行。',['a^b^cin 不是三个输入中恰好一个为 1。','cout 写成 a|b|cin 会错误地把只有一个 1 的情况判成进位。'],checkpoint('输入为 a=1,b=0,cin=1 时 sum、cout 是？',['sum=0,cout=1','sum=1,cout=0','sum=1,cout=1'],0,'两个 1 相加得到二进制 10；sum 为偶校验结果 0，cout 为 1。')),
 sec('l8-ripple','串行进位：四个全加器如何成为一个 4 位加法器','4、13',[
 '第 13 页把 stage0 到 stage3 串起来。最低位 stage0 接 carryin，产生 S[0] 和 C[1]；第二级使用 C[1]，以此类推，最高位产生 carryout。X、Y 的每一位只接到对应位的全加器，进位才沿着从最低位到最高位的方向传播，不能把四个 Cin 都接到 carryin。',
 'wire [3:1] C 只有三个内部进位节点。它们不是储存单元，而是相邻子模块之间的导线。位置端口例化必须严格遵守 fulladd 的端口排列；更易审查的写法是 .cin(C[1])、.a(X[1]) 这样的名称连接，读代码就能看出每根线的来源和去处。',
 '这种结构简单、可模块化，但延迟不为零。考虑 1111+0000+Cin：若 Cin 从 0 变 1，进位可能连续穿过四级才影响最高位。RTL 的功能仿真通常不展示真实门延迟，不能因为浏览器立即更新输出就推断硬件零延迟。增加位数也会拉长串行进位的关键路径。'
 ],"module adder4(input carryin,input [3:0] X,Y,\n              output [3:0] S,output carryout);\n  wire [3:1] C;\n  fulladd s0(.a(X[0]),.b(Y[0]),.cin(carryin),.sum(S[0]),.cout(C[1]));\n  fulladd s1(.a(X[1]),.b(Y[1]),.cin(C[1]),.sum(S[1]),.cout(C[2]));\n  fulladd s2(.a(X[2]),.b(Y[2]),.cin(C[2]),.sum(S[2]),.cout(C[3]));\n  fulladd s3(.a(X[3]),.b(Y[3]),.cin(C[3]),.sum(S[3]),.cout(carryout));\nendmodule",'四级 FA 串联：carryin→C1→C2→C3→carryout；各级并行计算局部输入，但进位到达限制最终稳定时间。',['实例端口次序错会连接出另一张电路。','四级串行进位不表示需要四个时钟；它仍然是组合电路。'],checkpoint('4 位串行进位加法器需要多少个内部进位节点，不含输入/输出进位？',['1','2','3','4'],2,'四级之间有三个连接点 C[1]、C[2]、C[3]。')),
 sec('l8-generate','参数与 generate：循环是在复制硬件','14–16',[
 '参数 n 把位宽从固定 4 变为可配置值。第 15 页用 wire [n:0] C 统一表示所有进位，C[0] 接 carryin，C[n] 接 carryout。这样每一级 i 都能使用相同接口 C[i]→C[i+1]，边界只需在循环外连接一次。',
 'generate-for 的索引是 genvar，循环在展开阶段生成 n 个子模块实例。begin:addbit 为每一级提供层次名称，例如 addbit[2].stage，便于波形定位和报错追踪。它不是每个时钟做一次循环，也不能拿运行时输入当作“要实例化几个模块”的条件。n 必须在展开时就确定。',
 '第 16 页另给 always 内的过程 for：用阻塞赋值先写 C[0]，再依次计算 S[k]、C[k+1]。这里用 integer k，工具对静态边界展开组合逻辑，仍不需要时钟。过程 for 没有自动引入存储；关键在于每个输出在本次计算中都能得到值，且后一级正确读取刚计算的进位。'
 ],"module ripple_g #(parameter n=4) (input carryin,\n input [n-1:0] X,Y,output [n-1:0] S,output carryout);\n wire [n:0] C;\n assign C[0]=carryin;\n assign carryout=C[n];\n genvar i;\n generate for(i=0;i<n;i=i+1) begin:addbit\n   fulladd stage(.a(X[i]),.b(Y[i]),.cin(C[i]),\n                 .sum(S[i]),.cout(C[i+1]));\n end endgenerate\nendmodule",'n 次生成得到 n 个物理全加器实例；过程 for 描述同样的组合关系，综合结果还可被优化。',['不要把 genvar 和运行时计数寄存器混为一谈。','过程组合计算若把进位改成 <=，后级可能读到旧进位，偏离原意。'],checkpoint('generate for 展开 n=8 的全加器时，发生什么？',['电路每 8 个时钟才完成一次加法','展开成 8 个全加器实例','只创建一个全加器反复运行'],1,'generate 是展开期结构复制，不是时间复用。')),
 sec('l8-overflow','同一个 1001：无符号 9，补码却是 −7','10–11',[
 '位串本身没有“正负”的物理标签，解释规则决定数值。4 位无符号范围 0…15，4 位二进制补码范围 −8…+7。数学结果超出所选范围才叫该解释下的溢出；存储的低 4 位仍会存在，只是它已经不是想要的数学结果。',
 '无符号加法观察最高位的输出进位 c4。课件的 0111+1110 产生 1_0101：按无符号是 7+14=21，低四位只剩 5，因而溢出；按补码是 +7+(−2)=+5，没有补码溢出。由此可以直接看出 carryout=1 并不等于 signed overflow=1。',
 '补码溢出看最高位输入进位与输出进位是否不同：V=c3^c4，也等价于“两个加数同号而结果异号”。0111+0010=1001，c4=0，却把 +9 读成 −7，故补码溢出。1001+1110=1_0111，表示 −7+(−2) 得到错误的 +7，补码与无符号解释此时都溢出。异号相加不会产生补码加法溢出。'
 ],"// s is the low four bits; a,b,s share a 4-bit interpretation.\nassign signed_overflow = (~(a[3] ^ b[3])) & (a[3] ^ s[3]);\n// If the actual carry into/out of the sign bit are exposed:\n// assign signed_overflow = c3 ^ c4;",'同一个加法器可接两套标志逻辑：无符号看 carryout；补码看最高位进位异或或符号变化。',['不要因为出现最高位进位就宣布补码溢出。','不要拿十进制标签代替先声明位宽与 signed/unsigned 解释。'],checkpoint('4 位 0111+0010=1001，哪种判断正确？',['无符号溢出，补码不溢出','无符号不溢出，补码溢出','两种都不溢出'],1,'无符号 7+2=9 在 0…15 内；补码 +9 超过 +7，结果变成负数。')),
 sec('l8-behavior','同一功能的不同 HDL 写法：位宽也是设计的一部分','16–17、19',[
 '结构例化、过程位循环、以及 {carryout,S}=X+Y+carryin 都能描述相同的加法功能。结构写法明确展示局部连接，行为加号更短，允许综合器选择加法结构；不能看到 + 就断言一定综合成课件的串行进位电路。第 19 页特别区分“功能相同”与“架构由综合选择”。',
 '拼接左值给结果预留 n+1 位，保留最高位进位。更便于核查的版本是把两个操作数都先零扩展，再执行 n+1 位加法，输出切片 S=wide[n-1:0]、carryout=wide[n]。不能先算到 n 位寄存器里，再期望事后补上一位能找回已经截掉的进位。',
 '第 17 页利用最高位的 sum 关系：sMSB=xMSB^yMSB^c_in_MSB，所以 c_in_MSB=xMSB^yMSB^sMSB。代入 V=c_out^c_in_MSB 得到 overflow=carryout^X[n-1]^Y[n-1]^S[n-1]。这里先用阻塞赋值更新加法结果，下一句才使用新的 S 和 carryout；它是组合计算的依赖顺序。'
 ],"module add4_flags(input [3:0] a,b,input cin,\n output [3:0] sum,output cout,overflow);\n wire [4:0] wide;\n assign wide = {1'b0,a} + {1'b0,b} + cin;\n assign sum = wide[3:0];\n assign cout = wide[4];\n assign overflow = cout ^ a[3] ^ b[3] ^ sum[3];\nendmodule",'宽 5 位的加法组合逻辑保留 carry；低四位连到 sum，最高位与符号位驱动 overflow。',['先截成 4 位再扩展到 5 位不能恢复进位。','行为等价不保证门数量、布局、延迟完全相同。'],checkpoint('为什么先对 4 位 a,b 做 {1\'b0,a}、{1\'b0,b}？',['为了产生一个时钟','为了显式保留 5 位算术结果','为了把它们变成负数'],1,'零扩展保持无符号数值，同时给最高位进位提供存储位宽。')),
 sec('l8-bcd','BCD 加法：为什么大于 9 要加 6','18–19',[
 'BCD 用 4 位表示一个十进制数字，只允许 0000…1001。输入 X、Y 必须是 0…9，Cin 是十进制低位来的进位，最大未修正结果为 9+9+1=19，所以中间量 Z 需要 5 位。若输入就是 1010，已违反 BCD 前提，不能把修正电路当作任意 4 位数到 BCD 的万能转换器。',
 'Z<10 时已经是有效个位，直接输出即可；Z≥10 时加二进制 0110。原因是十进制进位点在 10，而 4 位二进制进位点在 16，相差 6。比如 7+5=12，二进制 01100，加 00110 得 10010：Cout=1，S=0010，即十进制 12，而不是十进制 18。',
 '8+9=17，5 位 10001 加 00110 得 10111：输出十进制进位 1、个位 7。这里 Cout 表示十进制位进位；它既不是简单的 Z[4]，也不是补码 overflow。课件 if 分支对应“加法结果与 10 比较→必要时加 6→选择输出”的组合网络，没有寄存器。'
 ],"module bcd_digit(input [3:0] a,b,input cin,\n output [3:0] digit,output cout);\n wire [4:0] raw,fixed_sum;\n assign raw = {1'b0,a}+{1'b0,b}+cin;\n assign fixed_sum = raw < 5'd10 ? raw : raw+5'd6;\n assign digit = fixed_sum[3:0];\n assign cout = fixed_sum[4];\nendmodule",'5 位二进制加法器、≥10 比较器、加 6 修正逻辑与选择器组成一位十进制加法器。',['Cout 是十进制进位，不能直接只看原始 raw[4]。','练习输入域限定为合法 BCD 0…9。'],checkpoint('BCD 的 7+5 经修正后 {Cout,S} 应为？',['0_1100','1_0010','1_1000'],1,'12+6=18=5\'b10010，拆成十进制进位 1 和个位 2。'))
 ],
 exercises:[
 choice('l8-e1','判断半加器输出','l8-half','半加器输入 a=1,b=1 时完整输出是什么？',['carry=0,sum=1','carry=1,sum=0','carry=1,sum=1'],1,'和位为 XOR=0，进位为 AND=1，完整结果是 2。'),
 fill('l8-e2','补齐全加器的和','l8-full','填入按位运算符，使三个输入实现奇偶和。',"assign sum = a ___ b ___ cin;",['^'],'assign sum = a ^ b ^ cin;','三输入 XOR 为奇数个 1 时输出 1；OR 会在两个 1 时出错。',['两个空使用同一个运算符。']),
 coding('l8-e3','写一个完整全加器','l8-full','实现 sum 与 cout，自动穷举全部 8 种输入。输出位宽均为 1。',"module top(input a,b,cin,output sum,cout);\n assign sum = 1'b0;\n assign cout = 1'b0;\nendmodule","module top(input a,b,cin,output sum,cout);\n assign sum = a ^ b ^ cin;\n assign cout = (a & b) | (a & cin) | (b & cin);\nendmodule",[port('a'),port('b'),port('cin')],[port('sum'),port('cout')],fullAdderVectors,'两个输出必须同时正确；sum 看奇偶性，cout 看至少两个 1。',['先列出 0、1、2、3 个 1 时的二进制结果。']),
 choice('l8-e4','识别展开期循环','l8-generate','n=32 的 generate-for 在什么时候复制模块？',['每个上升沿','仿真跑到这一行时','展开设计时'],2,'参数与 genvar 确定结构，产生 32 个实例。时钟不参与 generate 展开。'),
 fill('l8-e5','补码溢出的进位判据','l8-overflow','c3 是最高位输入进位、c4 是输出进位。填入正确运算符。','assign overflow = c3 ___ c4;',['^'],'assign overflow = c3 ^ c4;','两个进位不同才产生补码溢出，使用 XOR。'),
 coding('l8-e6','修复丢失的进位','l8-behavior','原代码先把结果截成 4 位，cout 永远是 0。修复代码，保留 a+b+cin 的完整 5 位结果。',"module top(input [3:0] a,b,input cin,output [3:0] sum,output cout);\n assign sum = a+b+cin;\n assign cout = 1'b0;\nendmodule","module top(input [3:0] a,b,input cin,output [3:0] sum,output cout);\n wire [4:0] wide;\n assign wide = {1'b0,a}+{1'b0,b}+cin;\n assign sum = wide[3:0];\n assign cout = wide[4];\nendmodule",[port('a',4),port('b',4),port('cin')],[port('sum',4),port('cout')],[vec({a:0,b:0,cin:0},{sum:0,cout:0}),vec({a:7,b:2,cin:0},{sum:9,cout:0}),vec({a:15,b:0,cin:1},{sum:0,cout:1}),vec({a:15,b:15,cin:1},{sum:15,cout:1}),vec({a:8,b:8,cin:0},{sum:0,cout:1})],'边界 15+0+1 和 15+15+1 能暴露被截掉的最高位。',['先把 a、b 各扩展一位。'],2,'debug'),
 choice('l8-e7','同一位串，两种溢出','l8-overflow','4 位 0111+1110 的结果为 1_0101。以下正确的是？',['无符号溢出，补码不溢出','补码溢出，无符号不溢出','两种都溢出'],0,'无符号 7+14=21 超过 15；补码 +7−2=+5 在范围内。',['先给每个输入各写出两种十进制解释。'],2),
 coding('l8-e8','实现一位 BCD 加法','l8-bcd','输入保证 a,b∈0…9，cin∈0…1。输出 digit 为十进制个位，cout 为十位进位；测试覆盖全部 200 个合法组合。',"module top(input [3:0] a,b,input cin,output [3:0] digit,output cout);\n assign digit = a+b+cin;\n assign cout = 1'b0;\nendmodule","module top(input [3:0] a,b,input cin,output [3:0] digit,output cout);\n wire [4:0] raw,corrected;\n assign raw = {1'b0,a}+{1'b0,b}+cin;\n assign corrected = raw < 5'd10 ? raw : raw+5'd6;\n assign digit = corrected[3:0];\n assign cout = corrected[4];\nendmodule",[port('a',4),port('b',4),port('cin')],[port('digit',4),port('cout')],Array.from({length:200},(_,k)=>{const a=Math.floor(k/20),b=Math.floor(k/2)%10,cin=k%2,t=a+b+cin;return vec({a,b,cin},{digit:t%10,cout:Math.floor(t/10)});}),'修正后输出的高位是十进制进位，低 4 位必须始终在 0…9。',['raw 需要 5 位。','raw≥10 时加 6，而不是减 6。'],3)
 ]
};

const lesson9 = {
 id:9,title:'锁存器、触发器、寄存器与计数器',subtitle:'把“记住过去”落实到时钟边沿、复位、使能和波形',sourceFile:'Lecture09.pdf',sourcePages:37,available:true,
 summary:'从电平敏感与边沿敏感开始，追踪 = / <= 如何改变 D 端连线，再构造移位寄存器、模 N 计数器和级联使能。练习中的自动代码判定仅检查明确拆出的组合次态逻辑；完整时序模板另配逐边沿讲解。',
 objectives:['区分透明锁存与边沿采样，识别意外锁存器','正确写同步/异步复位及加载使能的优先级','逐句追踪阻塞与非阻塞赋值，画出对应 D 端连接','构造并行寄存器、串行移位和可暂停计数器','用终值条件级联十进制计数器并保持同一时钟','读写 testbench 时间线，计算 setup/hold 约束'],
 sections:[
 sec('l9-storage','从组合关系到记忆：锁存器与触发器的区别','2–6',[
 '组合电路只由当前输入决定输出；若同样的当前输入还能得到不同输出，就必须说明过去的状态是什么。第 3 页把时序电路画成组合 next-state 逻辑与状态寄存器的反馈环：组合逻辑计算下一份状态，存储元件决定何时接收它。记忆能力不来自 reg 这个名字，而来自代码要求保持的行为。',
 'D latch 在 EN=1 时透明，Q 会持续跟随 D，包含这一段时间内的短脉冲；EN=0 时保存最后一个值。always @(D,EN) if(EN) Q=D; 故意没有 else，因为“保持”就是锁存行为。它对电平敏感，不能把 EN 的整个高电平区域看成一次瞬间采样。',
 'D flip-flop 的 always @(posedge Clock) Q<=D; 只在上升沿采样，边沿之间保持。若 D 在两个上升沿之间出现并消失，触发器不会捕获这次脉冲；锁存器可能会跟随它。本课优先采用边沿触发的同步设计，便于把整个系统的更新时刻组织到同一个时钟边沿。'
 ],"module flipflop(input D,Clock,output reg Q);\n always @(posedge Clock) Q <= D;\nendmodule\n// Intentional latch: level-sensitive, a different device.\n// always @(*) if (EN) Q = D;",'latch 是 EN 打开时透明的存储；DFF 是时钟边沿采样的存储；并非同一个元件换了名字。',['reg 变量可能综合成组合逻辑、锁存器或触发器，需看完整行为。','不要认为 D 的每个脉冲都一定被触发器捕获。'],checkpoint('D 在两个上升沿之间先变 1 再回 0，下个上升沿仍为 0。DFF 将采到？',['中间出现过 1，因此采到 1','采到边沿时的 0','变成一个锁存器'],1,'边沿触发器只对采样边沿附近满足时序约束的 D 值响应。')),
 sec('l9-latch','为什么组合 if 缺一个 else 会造出锁存器','7、36–37',[
 'always @(*) if(sel) y=a; 在 sel=1 时规定 y=a，却没有规定 sel=0 时的 y。仿真语义要求 y 保留旧值，综合器就必须提供记忆能力。这是“意外锁存器”的根本原因，和你是否把 always 命名成 comb、是否使用阻塞赋值无关。',
 '第一种修复是写完整 if/else：sel=0 时明确 y=b；第二种是先写默认 y=b，再在 if(sel) 分支覆盖成 y=a。两种都保证本次执行的每一条路径为 y 赋值，得到一个 2:1 选择器。多个输出时，要分别逐一检查，而不是发现某一个变量有 default 就以为全部安全。',
 '对比时钟块里的 else if(E) Q<=D;：E=0 时没有赋值是有意让触发器保持，不是意外 latch。相同的“没有 else”在电平敏感组合块与边沿敏感块中含义不同。读代码时先圈出敏感表，再检查路径覆盖，最后才判断需要什么硬件；同时检查综合器的 latch inferred 警告。'
 ],"always @(*) begin\n y = b;           // value on the sel=0 path\n if (sel) y = a;  // override on the sel=1 path\nend",'每条路径赋值→纯 MUX；需要在无赋值路径保存 y→引入 latch。',['always @(*) 自动列敏感信号，却不会自动补全缺失赋值。','写 y=y 仍是在要求保持旧值，并没有消除锁存器。'],checkpoint('哪种写法可避免组合块中的意外 latch？',['always @(*) if(sel) y=a;','always @(*) begin y=b; if(sel) y=a; end','always @(*) if(sel) y=a; else y=y;'],1,'先给本次执行的默认值再覆盖，所有路径都会赋值。')),
 sec('l9-reset','复位和使能：先决定何时更新，再决定谁优先','8–10、32、34',[
 '异步低有效复位模板包含 negedge Resetn 和 posedge Clock：Resetn 变 0 的瞬间就清零，不用等待时钟。同步复位只把 posedge Clock 放在敏感表，若 Resetn 在两个边沿之间短暂拉低又释放，可能完全采不到。两者的区别是复位生效的时刻，不是 if 语句的长短。',
 'Resetn、rst_n 通常表示低有效，写 if(!Resetn)；HDLBits 的 reset、areset 练习却是高有效，写 if(reset) 并在异步情况下用 posedge areset。必须把命名、判断条件、敏感表边沿三者一起核对。异步复位释放仍需考虑 recovery/removal 等时序要求，不能因为拉低立即生效就认为释放毫无限制。',
 '带使能的触发器在复位之后写 else if(E) Q<=D;，因此复位优先，E=1 时采 D，E=0 时保持。硬件可理解成 D 端前的 2:1 MUX：选 D 或反馈的 Q；器件也可能直接使用带使能的触发器。暂停更新应使用 enable，而不是把时钟与 E 随意相与生成新的时钟。'
 ],"module dff_en(input D,E,Clock,Resetn,output reg Q);\n always @(posedge Clock or negedge Resetn)\n  if (!Resetn) Q <= 1'b0;\n  else if (E) Q <= D;\nendmodule",'DFF 的复位端接低有效异步清零；D 端逻辑由 E 在 D 与 Q 反馈间选择。',['低有效异步复位写成 posedge Resetn 会在释放时触发。','本课可综合 DFF 模板使用边沿事件，不能把 Resetn 电平事件与 posedge Clock 混写。'],checkpoint('异步高有效复位 areset 应采用哪条敏感表？',['@(posedge clk or posedge areset)','@(posedge clk or negedge areset)','@(posedge clk or areset)'],0,'复位在 areset 上升到有效电平时立即动作，所以使用 posedge areset。')),
 sec('l9-timing','采样不是理想瞬间：setup、hold 与最高频率','11、37',[
 'setup 时间 tsu 要求 D 在采样边沿之前稳定足够久；hold 时间 th 要求边沿之后继续保持。触发器输出也不是在边沿零延迟改变，clock-to-Q 时间 tcq 表示采样后 Q 达到有效状态需要多久。违反要求可能采错值或进入亚稳态，普通二值功能仿真通常不能模拟这种模拟电路现象。',
 '一条寄存器→组合逻辑→寄存器路径，在忽略时钟偏斜等额外因素时，setup 条件是 Tclk≥tcq,max+tcomb,max+tsu。若三者是 2 ns、6 ns、2 ns，时钟周期至少 10 ns，对应最高 100 MHz。优化组合逻辑最长路径可以提高这一上限，但不代表其他约束自动满足。',
 'hold 检查最短路径：tcq,min+tcomb,min≥th。数据如果到得太快，下一次变化会破坏接收触发器刚完成的采样；把时钟周期拉长通常不解决同一边沿的 hold 违例。工程中还需计入时钟偏斜、抖动与器件约束，本课公式是理解两类限制的起点。'
 ],"// Simplified register-to-register constraints (no clock skew):\n// Tclk >= tcq_max + tcomb_max + tsu\n// tcq_min + tcomb_min >= th\n// Example: 2ns + 6ns + 2ns = 10ns => fmax = 100MHz",'最长组合路径限制下一次边沿何时到来；最短路径限制当前边沿之后输入能有多快变化。',['提高周期通常可帮助 setup，不能据此宣称 hold 也修复。','浏览器功能示意不等于 STA 或亚稳态仿真。'],checkpoint('tcq,max=2ns、组合最大延迟=6ns、tsu=2ns，忽略偏斜时 fmax 是？',['50 MHz','100 MHz','500 MHz'],1,'最短可用周期 10ns，倒数为 100MHz。')),
 sec('l9-assignment','= 与 <=：真正改变的是后一句看见哪个值','12–16、21',[
 '阻塞赋值 = 执行到一行就立即更新变量，后面的语句读取新值；非阻塞赋值 <= 先按当前值计算右侧并排队，在当前时间步的 NBA 更新阶段统一更新左侧。对于每个寄存器只赋值一次的这些例子，<= 让同一边沿上各触发器读取旧 Q，贴近并行采样的硬件。',
 '假设边沿前 D=1、Q1=Q2=0。Q1=D; Q2=Q1; 先把 Q1 改为 1，再把 Q2 也改为 1，两个寄存器的 D 输入都等价于 D；工具可能合并相同寄存器。改成 Q1<=D; Q2<=Q1; 后得到 Q1=1、Q2=0，电路是 D→Q1→Q2 两级延迟。两种都在时钟块中，不能笼统地说 = 把寄存器消掉。',
 '第 13 页强调：决定是否有触发器的是跨边沿保持的要求，不是运算符。工程约定“组合块用 =，时钟块用 <=，一个信号由一个 always 写入”是为了减少顺序依赖和竞争。多个块写同一个 reg 会形成多驱动问题；不要用这种方式拼出所谓并行更新。'
 ],"// Two genuine stages: Q2 receives the OLD Q1.\nalways @(posedge Clock) begin\n Q1 <= D;\n Q2 <= Q1;\nend\n// With Q1=D; Q2=Q1; both D inputs become D instead.",'<= 连接 Q1 的 Q 到 Q2 的 D；依序阻塞赋值把 Q2 的 D 直接连接到输入 D。',['<= 不表示“下一个时钟才赋值”，它在当前采样事件后的 NBA 阶段更新。','单靠 = 或 <= 不能断言组合还是时序，必须看敏感表和保持需求。'],checkpoint('边沿前 D=1,Q1=0,Q2=0，执行 Q1<=D;Q2<=Q1; 后结果是？',['Q1=1,Q2=1','Q1=1,Q2=0','Q1=0,Q2=1'],1,'两条右侧都读取边沿前的值，Q2 取得旧 Q1=0。')),
 sec('l9-dataflow','追 D 端连线：逻辑级联、寄存器级联与交换','17–20',[
 '课件 Example 7.5 在时钟块中先写 f=x1&x2，再写 g=f|x3。第二句读取新的 f，等价于 g 的 D=(x1&x2)|x3；AND 输出分叉，一条进 f 的 D，一条通过 OR 进 g 的 D。f、g 都仍在边沿采样，只是 g 的输入组合路径跨过了两个门。',
 'Example 7.6 改用非阻塞后，g 的 D=(旧 f)|x3。OR 的一根输入从 AND 输出改接到 f 触发器的 Q 输出。于是 x1、x2 对 g 的影响先经过 f，再多等一个边沿；x3 对 g 仍是直接组合输入，不会因为 g 一行里出现 f 就也增加一个周期。',
 '交换两寄存器更直观：a<=b; b<=a; 在一个边沿让 a、b 同时取得对方的旧值，例如 3、7 变成 7、3。a=b; b=a; 会让第一句覆盖 a，第二句再次读到旧 b，最终两者都是 7。理解方式始终相同：为每个目标写出 D 表达式，而不是背“某运算符比较高级”。'
 ],"always @(posedge Clock) begin\n f <= x1 & x2;\n g <= f | x3;\nend\n// A one-edge swap, where both RHS values are OLD values:\n// always @(posedge Clock) begin a <= b; b <= a; end",'非阻塞版本：x1,x2→AND→f寄存器→OR→g寄存器；x3→OR→g寄存器。',['不要把 x3 也误判为必须先经过 f。','交换时先覆盖 a 再读取 a，会丢失原来的 a。'],checkpoint('a=3,b=7，时钟块执行 a=b; b=a; 后是什么？',['a=7,b=3','a=7,b=7','a=3,b=3'],1,'第一句 a 立即成为 7，第二句读新的 a，因此 b 仍为 7。')),
 sec('l9-shift','寄存器和移位：位序决定方向，加载决定优先级','22–25、33–35',[
 'n 位寄存器就是 n 个共享时钟与复位的触发器。Q<=D 在每个边沿整体并行加载，{n{1\'b0}} 是 n 个零的复制写法；else if(E) 则增添加载使能。位宽参数应在实例展开时确定，并按真实数据范围选择。并行赋值不意味着软件把各位逐个搬运。',
 '第 23 页的 4 位移位寄存器在 L=1 时 Q<=R，优先并行加载；L=0 时 Q[0]<=Q[1]、Q[1]<=Q[2]、Q[2]<=Q[3]、Q[3]<=w。由于读取的全是旧 Q，串行输入 1、0、1、1 从初始 0000 逐边沿得到 1000、0100、1010、1101。这里数据朝低位移动，所以叫右移。',
 '第 24 页把 for 版本压缩为 Q<={w,Q[n-1:1]}，两者功能相同。左移是 {Q[n-2:0],w}，右循环移位则把旧 Q[0] 放回最高位。HDLBits Shift4 的串行补入固定 0，且优先级为 areset>load>ena，不要照搬有 w 端口的课堂版本。SIPO、PISO 与延迟线都只是这些连接方式配合加载/读取协议的应用。'
 ],"module shift4(input [3:0] R,input L,w,Clock,\n output reg [3:0] Q);\n always @(posedge Clock)\n  if (L) Q <= R;\n  else Q <= {w,Q[3:1]};\nendmodule",'四个 DFF 各自 D 端前有加载 MUX；移位支路将旧高一位接到低一位，w 接最高位。',['对 [3:0]，{w,Q[3:1]} 是右移；不能按代码阅读方向猜。','for 在一个边沿展开并行更新，不是占用 n 个周期。'],checkpoint('Q=4\'b1010,w=1，执行一次 Q<={w,Q[3:1]} 后 Q 是？',['0101','1101','1011'],1,'Q[3:1]=101，前面拼入 w=1，得到 1101。')),
 sec('l9-counter','计数器：反馈加法器、模 N 比较器与终值使能','26–29、33–35',[
 'Q<=Q+1 将寄存器输出反馈到加法器，下一边沿重新装入结果。4 位 Q 丢弃超出的进位，因此 15→0，天然是模 16；减法在 0−1 时绕到全 1。加载型与上下计数器用 if(L)…else if(E)…表达“加载优先于计数”，E=0 直接保持，不需要停止时钟。',
 '十进制个位需要 0…9，不能只靠 4 位自然回绕。课件在 E=1 时比较 Q==9，真则下个值为 0，否则 Q+1。比较器和选择器是组合逻辑，Q 是存储。模 N 的一般结构比较 N−1，位宽至少能容纳 N−1；$clog2(N) 模板对 N=1 等边界需额外约束，课堂示例默认正常正整数计数范围。',
 '终值 tc=E&(Q==9) 表示“如果下一次边沿到来，本位将回绕”。把 tc 接到十位的使能，个位和十位仍共享同一 Clock，09→10 在同一边沿完成。不能把 tc 当作十位时钟：组合标志可能有毛刺，还会引入新的时钟域。注意 tc 必须含 E，否则个位暂停在 9 时十位还会不停增加。'
 ],"module decade(input Clock,Resetn,E,output reg [3:0] Q,output tc);\n assign tc = E & (Q==4'd9);\n always @(posedge Clock or negedge Resetn)\n  if (!Resetn) Q <= 4'd0;\n  else if (E)\n   if (Q==4'd9) Q <= 4'd0;\n   else Q <= Q+1'b1;\nendmodule",'Q 寄存器→加 1/比较 9→选择 D；tc 是驱动下一级 enable 的组合条件。',['4 位并不自动等于模 10。','tc 级联作 enable，不作 clock；E 必须参与 tc。'],checkpoint('级联两个 BCD 计数器时，个位 tc 应连接到十位哪里？',['时钟 Clock','使能 E','异步复位'],1,'共享时钟，用 tc 允许十位在个位回绕的同一个边沿增加。')),
 sec('l9-testbench','测试平台：刺激何时改变，结果何时观察','30–37',[
 'always #5 clk=~clk 产生 10 ns 周期时钟，前提是先让 clk=0；如果初始是 x，取反仍是 x。课件 testbench 在 0 ns 拉低 Resetn，22 ns 释放；E 在 32 ns 变 1。因此 25 ns 边沿仍不计数，真正首次计数发生在 35 ns，不能把输入改变时刻误读为寄存器更新时刻。',
 'E 从 32 到 82 ns 为 1，经历 35、45、55、65、75 ns 五个采样边沿，Q 从 0 到 5。82 到 102 ns 暂停，85、95 ns 两个边沿保持；102 ns 再使能后，在 105…135 ns 共四次更新得到 9。异步复位若重新拉低，则允许在边沿之间清零，这也要单独覆盖。',
 '第 32–35 页给出 Dff8r、Dff8ar、Shift4、Count10 的练习与解答，应按复位极性、敏感表、优先级、边界回绕逐项核对。浏览器题将部分电路拆成组合 next-state 函数来自动穷举；完整 DFF、移位器与计数器仍需在事件驱动 Verilog 仿真器里验证时钟、复位和 NBA 时序。'
 ],"// Testbench fragment; delays are stimulus, not synthesizable datapath.\nreg clk=0;\nalways #5 clk=~clk;\ninitial begin\n Resetn=0; E=0;\n #22 Resetn=1;\n #10 E=1;\n #50 E=0;\n #20 E=1;\n #40 $finish;\nend",'测试平台产生外部事件；DUT 只在敏感事件更新。波形中的输入边沿与寄存器边沿必须分开追踪。',['#5、$monitor、$finish 属于测试平台，不是要综合出的时钟发生器。','不要在同一采样边沿无延迟地既改输入又断言结果，容易产生竞争。'],checkpoint('clk 上升沿为 5,15,25,35…ns，E 在 32ns 置 1，第一次计数在哪一刻？',['32ns','35ns','40ns'],1,'E 先稳定，到下一次 35ns 上升沿才被采样。'))
 ],
 exercises:[
 choice('l9-e1','识别透明锁存器','l9-storage','EN=1 持续一段时间，期间 D 有短脉冲，哪种存储会持续跟随 D？',['上升沿 DFF','高电平透明 D latch','组合加法器'],1,'latch 在整个有效电平期间透明；DFF 只在边沿采样。'),
 fill('l9-e2','异步低有效复位边沿','l9-reset','为低有效 Resetn 补敏感表事件。','always @(posedge Clock or ___ Resetn)',['negedge'],'always @(posedge Clock or negedge Resetn)','Resetn 下降到 0 是复位的生效事件。'),
 fill('l9-e3','两级延迟应使用什么赋值','l9-assignment','两个空填相同赋值运算符，让 Q2 收到旧 Q1。','always @(posedge clk) begin Q1 ___ D; Q2 ___ Q1; end',['<='],'always @(posedge clk) begin Q1 <= D; Q2 <= Q1; end','非阻塞右侧读取旧值，在 NBA 阶段统一更新。'),
 choice('l9-e4','交换错误发生在哪里','l9-dataflow','边沿前 a=3,b=7。执行 a=b; b=a; 为什么没有交换？',['因为必须先清零 a','第一句覆盖 a，第二句读到新 a=7','因为寄存器不能交换'],1,'用 a<=b; b<=a; 可以在同一个边沿交换旧值。'),
 coding('l9-e5','实现移位器的组合 D 输入','l9-shift','本题只实现下一次边沿要装入的 next，不实现触发器：load=1 时 next=data，否则右移 q 并在最高位插入 w。',"module top(input [3:0] q,data,input load,w,output [3:0] next);\n assign next = q;\nendmodule","module top(input [3:0] q,data,input load,w,output [3:0] next);\n assign next = load ? data : {w,q[3:1]};\nendmodule",[port('q',4),port('data',4),port('load'),port('w')],[port('next',4)],Array.from({length:64},(_,i)=>{const q=i%16,load=(i>>4)&1,w=(i>>5)&1,data=15-q;return vec({q,data,load,w},{next:load?data:(w*8+(q>>1))});}),'这段代码只构成 D 端前的 MUX 与连线；完整移位器还要 always @(posedge clk) q<=next。',['先检查 load 的优先级，再检查右移位序。']),
 coding('l9-e6','修复十进制 next 与终值','l9-counter','输入 q 保证 0…9。本题检查组合次态：E=0 保持；E=1 且 q=9 则归零，否则加 1。tc 仅在 E=1 且 q=9 时为 1。',"module top(input [3:0] q,input E,output [3:0] next,output tc);\n assign next = E ? q+1 : q;\n assign tc = q==4'd9;\nendmodule","module top(input [3:0] q,input E,output [3:0] next,output tc);\n assign next = E ? (q==4'd9 ? 4'd0 : q+1'b1) : q;\n assign tc = E & (q==4'd9);\nendmodule",[port('q',4),port('E')],[port('next',4),port('tc')],Array.from({length:20},(_,i)=>{const q=i%10,E=Math.floor(i/10);return vec({q,E},{next:E?(q===9?0:q+1):q,tc:E&&q===9?1:0});}),'只加 1 是模 16；不把 E 与进 tc 会让暂停在 9 的高位继续计数。',['特别检查 q=9,E=0 和 q=9,E=1 两行。'],2,'debug'),
 choice('l9-e7','防止意外 latch','l9-latch','always @(*) if(sel) y=a; 应如何修成 y=sel?a:b 的组合电路？',['在前面默认 y=b','把 = 改成 <= 就够了','把敏感表改成 @(sel)'],0,'默认赋值覆盖 sel=0 路径，if 覆盖 sel=1 路径；运算符本身不补全路径。'),
 choice('l9-e8','计算周期上限','l9-timing','忽略偏斜，tcq,max=2ns、tcomb,max=6ns、tsu=2ns。fmax 是多少？',['10 MHz','100 MHz','1 GHz'],1,'周期至少 10ns，1/(10×10^-9)=100MHz。降低频率不能自动修复 hold。',[],2),
 choice('l9-e9','沿着 testbench 数采样边沿','l9-testbench','E 在 32ns 变 1，在 82ns 变 0。上升沿是 5,15,25…ns，共计几次增加？',['4 次','5 次','6 次'],1,'采样边沿为 35、45、55、65、75ns，总共五次；32、82ns 是刺激时刻。',[],2),
 choice('l9-e10','级联时钟保持统一','l9-counter','个位暂停在 9 时，十位也应暂停。哪条 tc 正确？',["tc=(q==4'd9)","tc=E & (q==4'd9)","tc=Clock & E"],1,'必须同时满足处于终值和本位使能，tc 接高位 E 而不是 Clock。')
 ]
};

const lesson10 = {id:10,title:'Lecture 10 · 等待课件更新',subtitle:'当前目录没有 Lecture10.pdf；保留课程编号与扩展入口',sourceFile:'Lecture10.pdf（未提供）',sourcePages:0,available:false,summary:'已核查当前提供的课件：Lecture09 后直接是 Lecture11。此位置保留更新空间，不根据相邻课程猜测第 10 讲内容。上传实际课件后，应重新逐页提取、核对图示、增加知识节与对应练习。',objectives:['等待原始 Lecture10 课件后建立可核查的内容与练习映射'],sections:[],exercises:[]};

const lesson11 = {
 id:11,title:'有限状态机：Moore 与 Mealy',subtitle:'从文字规格、状态图和状态表，到电路与安全 Verilog 模板',sourceFile:'Lecture11.pdf',sourcePages:29,available:true,
 summary:'围绕连续两个 1 检测器，完整推导状态为什么存在、如何编码、怎样计算次态与输出，再比较 Moore、Mealy 及注册输出的时序。课件教材代码中的 xx 默认值会作为风险点讨论，并采用回到起始态的安全示例。',
 objectives:['根据“必须记住什么”定义状态而非机械背图','由状态表逐位推导 D 输入方程','解释 Moore 与 Mealy 的响应时刻和输入毛刺路径','写出状态寄存器、组合次态、输出三部分','用默认值避免 latch 并规定非法状态恢复','区分注册输出与组合状态译码，编写无采样竞争的测试平台'],
 sections:[
 sec('l11-flow','FSM 不是软件流程：它是存储状态加两块组合逻辑','2–4',[
 '有限状态机把历史信息压缩成一个有限集合中的状态。第 3 页的通用结构包含状态寄存器 Q、计算 next 的组合逻辑、以及计算 Z 的输出逻辑；输入 W 可影响 next，Mealy 还让 W 直接进入输出逻辑。只要把状态寄存器拿掉，机器就无法区分“当前输入相同、过去历史不同”的情况。',
 '设计顺序是文字规格→状态图→状态表→状态编码→逻辑方程→电路或 Verilog。每一步都解决不同问题：文字规定观察时刻和边界条件；状态图定义记忆含义；状态表检查每种输入的确定结果；编码把抽象标签装进触发器。实用 RTL 常从状态表直接写 case，编码和优化可交给工具。',
 '状态不是“程序执行到第几行”，而是当前触发器中保存的码。组合 next 可能在周期中随输入变化，但 state 只有在指定时钟边沿装入 next。读 FSM 波形时应同时标出当前 state、当前输入、待装入 next，不能把三者混在一栏。'
 ],"// FSM structure, not a complete module:\n// next  = F(state,input);   // combinational gates\n// state <= next;           // only at the clock edge\n// out   = G(state);        // Moore\n// out   = G(state,input);  // Mealy",'反馈环由组合 F 与状态 DFF 组成；输出 G 是从状态读取的信息，Mealy 额外读取当前输入。',['case 是次态函数的表达方式，不是让每个 case 分支占一个软件执行步骤。','先明确输出对应边沿前还是边沿后的时间，再比较波形。'],checkpoint('FSM 的历史记忆实际保存在什么地方？',['next 的组合门里','state 的触发器里','case 关键字里'],1,'状态码由触发器保存，组合门只计算当前输入下的 next/out。')),
 sec('l11-moore','连续两个 1：状态的含义比状态的名字重要','5–8',[
 'Moore 规格是 z 表示过去两个采样周期的 w 都是 1。状态 A 表示连续 1 的长度为 0（或刚复位），B 表示已经看到一个 1，C 表示已经看到至少两个连续 1。超过两个不必增加新状态，因为未来行为与“恰好两个”完全一致：只要继续为 1 就继续报告，出现 0 就中断。',
 '状态表逐行读：A 遇 0 留 A、遇 1 去 B；B 遇 0 去 A、遇 1 去 C；C 遇 0 去 A、遇 1 留 C。输出只在 C 为 1，因此写在状态圆圈内。输入 w 的每种取值在每个状态都必须有唯一出口；缺少出口意味着规格不完整，重叠出口则需要额外优先级解释。',
 '从复位 A 开始，连续采样 1、1、1、0，边沿后的状态依次是 B、C、C、A，输出依次 0、1、1、0。它是允许重叠的连续检测：111 中后两个采样窗口都满足条件。第 7 页用相同 w 序列与状态/输出并列表格，帮助区分输入时间标签与历史记忆。'
 ],"// State table:\n// current | w=0 next | w=1 next | z\n// A       | A        | B        | 0\n// B       | A        | C        | 0\n// C       | A        | C        | 1",'三个状态区分“零个连续 1 / 一个连续 1 / 至少两个连续 1”，并非保存整段输入历史。',['C 遇到 1 应留在 C，不能自动回到 A 而漏掉重叠。','输出为 1 的状态不一定只停一个周期，取决于转移条件。'],checkpoint('机器已在 C，新的采样输入仍为 1，下一状态与输出是？',['A,z=0','B,z=0','C,z=1'],2,'连续 1 的条件仍满足，因此 C 自环并保持 z=1。')),
 sec('l11-equations','从状态表读出方程，再把方程接到 D 端','9–11',[
 '给 A=00、B=01、C=10 编码，需要两个触发器。课件用小写 y2,y1 表示当前 Q，用大写 Y2,Y1 表示下次要装入的 D。码 01 的两位是并列状态位，不是 y2 与 y1 的乘积。剩余 11 是非法/未使用码，应明确工具优化和实际恢复策略。',
 'w=0 时所有合法态都回 00，因此 Y1、Y2 中都要含 w。只有 A 且 w=1 时下一状态是 01，所以 Y1=w&~y1&~y2；B 或 C 且 w=1 时下一状态是 10，所以 Y2=w&(y1|y2)。合法态下 z=y2。每个方程中的 AND、OR、NOT 都能直接对应第 11 页门图的一部分。',
 '这些简化利用了非法 11 不会正常到达的假设：例如 z=y2 在 11 也会输出 1，但安全比较 z=(state==C) 在 11 输出 0。把未用码当 don\'t care 可以简化逻辑，却不能同时宣称已定义安全恢复。教学练习会明确输入只取合法状态；完整模板则使用 default: next=A。'
 ],"// y[1] = y2, y[0] = y1, legal states 00/01/10.\nassign next[0] = w & ~y[0] & ~y[1];\nassign next[1] = w & (y[0] | y[1]);\nassign z = y[1];",'两个 DFF 保存 y2,y1；组合门产生 next，Q 再反馈到门输入；z 可从状态位直接取出。',['Y 是 D 端次态，小写 y 是 Q 端现态，不应互换。','合法态等价不保证在非法态也等价。'],checkpoint('在 B=01 且 w=1 时，Y2Y1 应是什么？',['00','01','10'],2,'B 遇 1 转 C，C 的编码为 10。')),
 sec('l11-mealy','Mealy：减少记忆状态，用当前输入更早响应','12–17',[
 'Mealy 版本只需记住上一次 w：A 表示之前是 0，B 表示之前是 1。次态 Y=w；输出 z=w&y。当前在 B 而 w 变成 1 时，不必先进入额外 C 才报告，当前周期就可输出 1。状态图因此把输入/输出写在箭头上，状态表也需要分别列 w=0 和 w=1 的输出。',
 '比较时要固定观察约定。从 A 开始，第一个 1 在采样后让状态变 B；当第二个 1 出现在下一个周期中，Mealy 的 AND 已能输出 1，Moore 要在该值被采样、状态进入 C 后才输出。课堂所称“早一个周期”基于这组周期标签；不能脱离输入更新时间把所有机器都机械断言为恒定整周期差。',
 '输入到 z 有直接组合路径，所以短脉冲可能直接出现在输出。将 z_mealy 再寄存：z_reg<=w&y，就消除当前输入直接穿透的路径，但会增加一个触发器并改变输出时序。Moore 输出在理想功能模型只随 state 更新；若是多位二进制状态的组合译码，真实门延迟仍可能产生短毛刺，严格无毛刺控制需注册输出。'
 ],"module mealy_detector(input clk,rst_n,w,output z);\n reg previous;\n always @(posedge clk or negedge rst_n)\n  if(!rst_n) previous <= 1'b0;\n  else previous <= w;\n assign z = previous & w;\nendmodule",'一个 DFF 保存 previous，AND 把 previous 与当前 w 组合成 z；注册 z 则增加第二个 DFF。',['Mealy 输出不能未经处理用作时钟。','Moore 的功能时序稳定性不等于所有真实组合译码都绝无毛刺。'],checkpoint('Mealy 输出 z=w&y，y=1 时 w 在周期中出现短脉冲，z 会怎样？',['可能直接出现短脉冲','必须等下一时钟才变','始终为 0'],0,'w 到 AND 输出有直接组合路径，因此脉冲可能传播。')),
 sec('l11-template','三部分模板：谁负责记忆，谁负责计算','18–20',[
 '第一部分是状态寄存器：只在时钟或异步复位事件中写 state，用 <=，复位装入 A，否则装入 next。第二部分 always @(*) 用 = 计算 next，case 每一支对应状态表的一行。第三部分独立表达输出，比如 assign z=(state==C)。这种划分让每个信号只有一个写入来源，便于定位错误来自记忆、转移还是译码。',
 '状态码用 localparam，因为它是模块内部约定，不应让实例随意覆盖。位宽、计数模数这类有意可配置的量才用 parameter。next 只是组合结果，声明为 reg 不会自动创建 next 寄存器；它在 always 中赋值且每条路径完整，综合为门和选择器。',
 '第 20 页展示小 FSM 可以把状态转移 case 直接放进时钟块，省掉 next 变量，但所有赋值必须改用 <=。两种风格都能实现相同功能；不要把“3-block”理解成一定有三个 always，简单 assign 输出同样构成第三个逻辑职责。复杂 Mealy 或多输出控制器通常更适合清楚分开的写法。'
 ],"module moore_detector(input clk,rst_n,w,output z);\n localparam [1:0] A=2'b00,B=2'b01,C=2'b10;\n reg [1:0] state,next;\n always @(posedge clk or negedge rst_n)\n  if(!rst_n) state<=A; else state<=next;\n always @(*) begin\n  case(state)\n   A: next=w?B:A;\n   B: next=w?C:A;\n   C: next=w?C:A;\n   default: next=A;\n  endcase\n end\n assign z=(state==C);\nendmodule",'state 是两个触发器；next 是通向 D 端的组合网络；z 是状态等值比较器。',['state 只能由状态寄存器块写入。','组合 next 使用 =，不能直接把整段时钟 case 原封不动搬过去保留 <=。'],checkpoint('三部分模板中的 next 变量声明为 reg，意味着？',['必然有 next 触发器','只说明在过程块赋值，硬件由赋值路径与事件决定','必然是锁存器'],1,'always @(*) 中完整赋值的 next 是组合逻辑。')),
 sec('l11-default','默认值、非法态与 xx：防 latch 也要防卡死','19、21–23、27',[
 '第 19 页保留教材 default:Y=2\'bxx 的写法，第 21 页随后明确建议改成 Y=A。xx 是仿真未知与综合 don\'t care 的提示，不能当成真实硬件会自动返回安全态的命令。若安全恢复重要，就明确写入 A，并在验证中覆盖非法编码；综合工具是否保留这条恢复逻辑还取决于 FSM 优化设置。',
 'Mealy 的组合块常同时写 next 与 z：先默认 next=A、z=0，再在 case 中按需要覆盖。比如 B 且 w=1 时 next=B、z=1；如果 B 且 w=0 不另写 z，也仍会使用本次计算的默认 0，因而没有 latch。没有默认值时，忘记任意一条分支的 z 就要求保存旧输出。',
 '默认状态分支与默认赋值解决两个不同维度：default case 覆盖非法 state 码；块开头默认 next/z 覆盖合法分支里遗漏的输入路径。即使只有两个 1 位状态、所有编码用尽，仍可用默认赋值让代码清楚。手工敏感表容易漏信号，always @(*) 能避免这类仿真与综合不一致。'
 ],"always @(*) begin\n next=A;\n z=1'b0;\n case(state)\n  A: if(w) next=B;\n  B: if(w) begin next=B; z=1'b1; end\n  default: next=A;\n endcase\nend",'完整组合函数由默认值加覆盖条件构成；非法状态恢复也是明确的 D 端函数。',['default: next=2\'bxx 不是复位。','只给 next 默认值而忘记 z，仍可推导出输出 latch。'],checkpoint('要让编码 11 在下个边沿回 A，应怎么写？',["default: next=2'bxx;",'default: next=A;','default: ;'],1,'明确返回 A 才定义了恢复功能，xx 与空分支都没有给出同样保证。')),
 sec('l11-output','输出的三种写法：组合译码与注册时刻','24',[
 'assign z=(state==C) 适合单一 Moore 标志，硬件是状态比较逻辑。always @(*) 先 z=0 再 case(state) 选 C 时置 1 也能给出同样组合关系，适合许多控制输出并列设置。两者不会仅因写法不同就额外增加一个周期。',
 '如果 z 必须是真正注册的稳定控制信号，可以在时钟块令 z<=(next==C)。状态同时执行 state<=next，所以边沿后 z 与新的 state 对齐。若误写 z<=(state==C)，它读取的是旧 state，输出就相对新状态多落后一个周期。这正是非阻塞赋值读取旧值规则在 FSM 中的直接应用。',
 '独立输出寄存器还需要定义复位行为，避免系统刚启动时状态已清零而 z 仍未知。注册输出的代价是触发器和对组合输入路径的时序约束；是否多一个周期取决于计算的是 next 还是当前 state，不能看到 output reg 就一概宣称已经注册，reg 仍只是赋值类型。'
 ],"always @(posedge clk or negedge rst_n)\n if(!rst_n) begin\n  state <= A;\n  z <= 1'b0;\n end else begin\n  state <= next;\n  z <= (next==C); // aligned with NEW state after this edge\n end",'z 增加一个输出 DFF；其 D 连接 next 的译码时，与本边沿装入的新 state 保持对齐。',['z<=(state==C) 与 z<=(next==C) 时序不同。','output reg 并不自动表示有输出触发器。'],checkpoint('同一边沿 state<=next；若希望 z 与边沿后的 state==C 对齐，应使用？',['z<=(state==C)','z<=(next==C)','z=state'],1,'<= 右侧读取旧值；next 代表这次边沿即将装入的状态。')),
 sec('l11-testing','用序列、非法态与采样时刻验证 FSM','25–29',[
 '课件用 reg [0:10] seq=11\'b01011011101 保存刺激，索引方向是 [0:10]，所以 seq[0] 就是左端第一个 0。testbench 在下降沿修改 w，在上升沿后延迟 #1 再观察 dut.y 与 z，留出非阻塞更新的时间，也把刺激和采样边沿错开。不要把 #1 抄入可综合 FSM 来“修复”时序。',
 '测试至少覆盖复位、单个 1、被 0 打断的 1、连续 11、连续 111、多次重叠，以及非法状态的恢复设计。Moore 与 Mealy 的参考模型要分别按状态/输入定义，而不是简单把同一条期望数组硬套给两者。中间周期插入 w 脉冲还能观察 Mealy 输出的输入穿透。',
 '第 27–29 页总结常见错误：漏默认、错赋值、重复写 state、缺复位、把 Mealy 输出直接当时钟。Fsm1、Fsm2 用作下一讲热身。本站自动题检查状态转移与输出组合函数，时序波形讲解是教学模型；真正事件调度、x/z、时序检查应继续用完整 Verilog 仿真工具。'
 ],"// DUT is moore_detector from the template section.\n// Drive away from the sampling edge, then inspect after NBA updates.\n@(negedge clk) w=seq[i];\n@(posedge clk) #1;\n$display(\"state=%b z=%b\",dut.state,z);",'刺激在下降沿送达，状态在上升沿更新，检查在 NBA 更新之后进行，三个时刻各有作用。',['[0:10] 与 [10:0] 的首位索引不同。','功能例题通过不等于物理复位释放、setup/hold 和亚稳态已验证。'],checkpoint('为什么 testbench 在 @(posedge clk) 后再 #1 观察状态？',['让 DUT 多运行一个周期','避开同一时间步非阻塞更新尚未完成的竞争','给 generate 创建模块'],1,'#1 是测试平台观察延迟，用于看到本次边沿后的更新结果。'))
 ],
 exercises:[
 choice('l11-e1','状态必须记住什么','l11-moore','Moore 连续两个 1 检测器为何用 A/B/C 三种状态？',['保存全部历史位串','区分零个、一个、至少两个连续 1','分别对应输入 0、输入 1、时钟'],1,'对未来行为足够的最小历史分类是连续 1 长度截断到 2。'),
 fill('l11-e2','补齐 Moore 转移','l11-moore','编码 A=00,B=01,C=10。在 B 且 w=1 时应进入哪个命名状态？','B: next = w ? ___ : A;',['C'],'B: next = w ? C : A;','第二个连续 1 让机器进入 z=1 的 C 状态。'),
 coding('l11-e3','由表实现安全 Moore 次态','l11-template','输入 state=0/1/2 分别为 A/B/C，3 为非法。实现 next 与 z；非法态 next=0,z=0。本题只检查组合函数。',"module top(input [1:0] state,input w,output [1:0] next,output z);\n assign next = state;\n assign z = 1'b0;\nendmodule","module top(input [1:0] state,input w,output [1:0] next,output z);\n assign next = state==2'd0 ? (w?2'd1:2'd0) : (state==2'd1 ? (w?2'd2:2'd0) : (state==2'd2 ? (w?2'd2:2'd0) : 2'd0));\n assign z = state==2'd2;\nendmodule",[port('state',2),port('w')],[port('next',2),port('z')],Array.from({length:8},(_,i)=>{const state=i>>1,w=i&1;return vec({state,w},{next:state===3?0:w?(state===0?1:2):0,z:state===2?1:0});}),'合法三态逐行映射状态表，非法态也有确定返回值。',['先独立写输出 z，再覆盖四种 state。'],3),
 coding('l11-e4','实现两状态 Mealy 的组合部分','l11-mealy','previous 是上一周期输入，w 是当前输入。输出 next_previous 和 z；不用也不允许在此题写时钟块。',"module top(input previous,w,output next_previous,z);\n assign next_previous = previous;\n assign z = previous;\nendmodule","module top(input previous,w,output next_previous,z);\n assign next_previous = w;\n assign z = previous & w;\nendmodule",[port('previous'),port('w')],[port('next_previous'),port('z')],Array.from({length:4},(_,i)=>{const previous=i>>1,w=i&1;return vec({previous,w},{next_previous:w,z:previous&w});}),'一个 DFF 的 D=w；组合输出为当前 w 与上次 w 的 AND。',['z 需要同时满足过去和现在都是 1。']),
 choice('l11-e5','找到 Mealy 毛刺路径','l11-mealy','y=1 时 z=w&y 可能跟随输入短脉冲。最直接的稳定控制输出方案是？',['把 z 作为新的 clock','在已有时钟域注册 z','把 & 改成 |'],1,'输出寄存器切断输入对外部输出的直接组合穿透，同时必须接受相应时序变化。'),
 fill('l11-e6','非法状态安全恢复','l11-default','希望 next 遇到未使用码时回到起始状态 A。','default: next = ___;',['A'],'default: next = A;','xx 作为 don\'t care 不是硬件恢复动作，空分支又可能导致 latch。'),
 choice('l11-e7','注册输出与新状态对齐','l11-output','state<=next；希望同一边沿后 z 等于新状态是否为 C，应写？',['z<=(state==C);','z<=(next==C);','z<=z;'],1,'非阻塞读取旧 state，而 next 就是本次装入的新状态。',[],2),
 choice('l11-e8','识别组合译码的物理边界','l11-mealy','“Moore 输出只依赖状态”在实际门电路里还需注意什么？',['多位状态组合译码仍可能因门延迟出现短毛刺','Moore 电路完全不需要触发器','所有 Moore 输出都自动带独立触发器'],0,'理想 RTL 下只随状态更新，不代表二进制状态位同时物理到达；严格稳定输出宜寄存。',[],3),
 choice('l11-e9','测试时刻正确排序','l11-testing','最适合本课上升沿 FSM 的刺激和检查方式是哪种？',['上升沿同时改 w 并立刻读 state','下降沿改 w，上升沿后再观察更新结果','在 generate 中改变 w'],1,'刺激与采样错开，观察放在 NBA 更新之后，减少仿真竞争。')
 ]
};

const lesson12 = {
 id:12,title:'ASM 图与状态编码',subtitle:'共用 Lecture12–13：本讲按主题阅读原文件第 3–15 页',sourceFile:'Lecture12-13_v3.pdf',sourcePages:36,available:true,
 summary:'原始材料是一份 36 页的 12–13 合并课件。这里把 ASM 符号、精确周期、条件输出、二进制与 one-hot 编码以及 Verilog 翻译放在第 12 讲；第 13 讲继续原文件的总线与交换系统，不假称原 PDF 有独立分界。',
 objectives:['把状态图转换为每状态一周期的 ASM 图','分清状态框、判断框、条件输出框及其时序含义','确保判断路径完整且互斥','由 P/Q/R 例子生成状态表、二进制方程与门图','比较二进制、Gray 风格与 one-hot 的触发器和译码成本','把 ASM 直接翻译为安全三部分 FSM'],
 sections:[
 sec('l12-meaning','ASM 为什么像流程图，却有严格的硬件时间','1–6',[
 '第 3–4 页从上一讲的 Moore 检测器 C 状态出发：C 状态框里列 z，表示整个 C 周期 z=1；框下判断 w，w=1 回 C，w=0 去 A。状态图的圆圈改成状态框、箭头标签改成判断框，描述的仍是同一个 FSM，而非另一种计算模型。',
 '关键新增阅读约定是“一个状态框对应一个时钟周期”。从 C 框沿判断线走到出口，不表示软件执行了一条 if 后多耗一个周期。门电路一直查看 w，真正状态跳转发生在结束 C 周期的时钟边沿。图中的连接圆点只是线的汇合，既不是新状态也不增加周期。',
 'ASM 对许多条件、多步数据传输的控制器更清楚：每个状态一组控制输出，再用判断框组织转移条件。对于只有两三个状态的简单机器，状态图或直接写清晰 case 也可以；ASM 不增加表达能力，价值在于让算法步骤与周期边界可视、可检查。'
 ],"// One ASM state C, one cycle:\n// outputs during C: z=1\n// next=(w ? C : A)\n// clock edge ending C: state<=next",'状态框对应状态寄存器的一种值，判断框对应组合条件，出口连接到 next-state 逻辑。',['图上经过几个框不等于经过几个周期。','连接点与条件输出框不是独立状态。'],checkpoint('从一个状态框经过两个判断框后到达下一状态框，通常过了几个状态周期？',['1 个','2 个','3 个'],0,'判断框属于当前 ASM 块，不单独耗时；状态只在边沿转换。')),
 sec('l12-symbols','三种符号：状态输出、判断与条件输出','7、11',[
 '状态框描述机器处于该状态时持续有效的输出，属于 Moore 输出；没有列出的命令默认视为 0。判断框检测输入或状态条件，每种输入值都必须有一个出口。条件输出框通常画成圆角，只在当前状态的特定判断路径上有效，属于 Mealy 输出。看图时先认形状，再认路径，不能只看里面写的信号名。',
 '课件用命令输出 CMD1、CMD2 与状态输入 Z 区分控制方向。CMD 是控制器发往数据通路的“装入某寄存器”等命令；Z 是数据通路返回给控制器的条件或状态。P 的状态框列 CMD1，所以 P 整周期 CMD1=1；P 的 Z=0 分支附 CMD2 条件输出，因此仅在 P 且 Z=0 时额外拉高 CMD2。',
 '同一个 CMD2 还可以出现在 Q 的状态框里，表示在 Q 无论 Z 如何都为 1。这两个来源在输出方程中用 OR 合并。R 没列输出则两个 CMD 都为 0。条件输出不是“先执行命令再等一周期”，而是当前路径选择和输出逻辑在同一周期中共同有效。'
 ],"// Abstract symbolic state bits P,Q,R (one-hot):\nassign CMD1 = P;\nassign CMD2 = Q | (P & ~Z);",'CMD1 只取当前状态，CMD2 同时有 Q 状态译码和 P∧¬Z 条件路径。',['同名输出在不同状态/路径出现，应合并有效条件，不是生成多个独立驱动。','圆角条件输出属于当前状态，不增加状态计数。'],checkpoint('P 框有 CMD1，P 的 Z=0 路径有 CMD2，则 P,Z=1 时输出是？',['CMD1=1,CMD2=1','CMD1=1,CMD2=0','CMD1=0,CMD2=1'],1,'CMD1 是 P 的无条件状态输出，CMD2 的 P 路径要求 Z=0。')),
 sec('l12-time','判断是一直连接的门：不是顺序执行的测试指令','8–9',[
 '第 8 页中 A 后面判断 X，X 为真去 B、为假去 C。X 在 A 周期中被组合门持续查看，边沿到来时把当时计算出的次态装入寄存器。在硬件里“测试”指的是输入接到了门网络，不是有一个处理器按流程图从上往下执行判断指令。',
 '第 9 页把某条判断路径落实为一只 AND 门与一个 DFF：例如当前状态译码与 Z 相与产生“下一状态 B 的 D”。输出逻辑与测试逻辑并行工作，因此状态输出并不会等判断结束才发生。多层判断意味着更多组合逻辑深度，可能影响时序，却不自动增加时钟周期。',
 '若判断多个位，例如 PQ 的出口写 10、11、0X，0X 覆盖 00 与 01；四种组合恰好各进一个出口才是完整确定的函数。出口漏项会留下未定义行为，出口重叠则要明示优先级。输入仍需满足采样触发器相关的 setup/hold 条件，图上“无额外周期”不代表门延迟为零。'
 ],"// next_B represents a D-input condition, not a clock.\nassign next_B = in_A & X;\nassign next_C = in_A & ~X;",'判断条件构成组合门，门输出接 D 端；时钟边沿负责存入，判断本身不是时钟。',['无额外周期不等于无传播延迟。','有 X/Z 等未知值时完整仿真语义比本题二值条件更复杂。'],checkpoint('多位输入 PQ 的出口为 10、11、0X，这些出口覆盖情况如何？',['漏掉 01','完整且互斥覆盖 00/01/10/11','10 与 0X 重叠'],1,'0X 覆盖前一位为 0 的 00、01，其余由 10、11 覆盖。')),
 sec('l12-encoding','二进制、Gray 风格、one-hot：编码改变电路成本','10',[
 '课件给三个抽象态 P/Q/R 三种分配：本例二进制 P=00,Q=11,R=10；Gray 风格 P=00,Q=01,R=10；one-hot P=100,Q=010,R=001。编码与状态含义是两层，P 叫 00 并不意味着这个状态必须输出 0。任意一一对应的分配都能实现相同状态机，只是逻辑方程不同。',
 'n 态二进制至少需要 ceil(log2 n) 个触发器，one-hot 使用 n 个触发器且合法时恰好一个状态位为 1。三个态分别需要 2 与 3 个；五个态分别需要 3 与 5 个。one-hot 更容易从图直接读取方程，但多用存储资源；在 FPGA 上具体最优方案取决于器件与综合工具，不宜只凭位数下结论。',
 'Gray 风格让本图 P↔Q、P↔R 这些实际转移只翻一个位，可减少特定状态变换中的同时翻转；不能推广为任意状态图都存在所有边只翻一位的编码。one-hot 还要处理全 0 或多 1 非法码，复位时明确装入某个合法态，否则“恰好一个 1”的性质并不会自动成立。'
 ],"localparam [1:0] P_BIN=2'b00,Q_BIN=2'b11,R_BIN=2'b10;\nlocalparam [2:0] P_HOT=3'b100,Q_HOT=3'b010,R_HOT=3'b001;\n// 5-state example: binary ceil(log2(5))=3 FFs; one-hot=5 FFs.",'二进制减少触发器但需译码；one-hot 直接把各状态存在性放在独立触发器上。',['one-hot 合法码不包括全零，除非像后面的特殊 idle 序列器另作定义。','状态数量与输出数量无必然相等关系。'],checkpoint('5 态 FSM 的二进制最少与 one-hot 触发器数量分别是？',['2 与 5','3 与 5','5 与 3'],1,'2 位只有 4 码，不足；3 位可容纳 8 码，one-hot 每态一位共 5 位。')),
 sec('l12-equations','P/Q/R 实例：图→表→方程→电路','11–14',[
 'P 遇 Z=1 去 Q，遇 Z=0 去 R；Q、R 都无条件回 P。P 的 CMD1=1，Q 的 CMD2=1，而 P,Z=0 的条件路径也令 CMD2=1。按本课二进制 A B 编码 P=00,Q=11,R=10，表中 P,Z=0 的 D(A)D(B)=10，P,Z=1 为 11，Q/R 都为 00。',
 '逐输出列找 1，并把相应条件 OR 起来。利用未使用 01 作为 don\'t care，可以化为 D(A)=~A，D(B)=~A&Z，CMD1=~A，CMD2=B|(~A&~Z)。这里 A、B 是状态位，不是抽象状态名；Z 的直接参与使 CMD2 是 Mealy 输出。第 14 页把它落实为两个 DFF 与 NOT/AND/OR 门。',
 '若改用 one-hot，令状态位 P,Q,R 对应各态存在性，则 D(P)=Q|R，D(Q)=P&Z，D(R)=P&~Z，CMD1=P，CMD2=Q|(P&~Z)。这些方程从入边直接读出，概念上更清楚。两套方程只在各自合法编码前提下保证与图等价；安全模板应对非法码另给恢复值。'
 ],"// Binary state bits A,B; valid codes are 00,11,10.\nassign DA = ~A;\nassign DB = ~A & Z;\nassign CMD1 = ~A;\nassign CMD2 = B | (~A & ~Z);\n// One-hot equivalents: DP=Q|R; DQ=P&Z; DR=P&~Z;",'二进制两只 DFF 反馈到简化门网络；one-hot 三只 DFF 的 D 端由各状态入边的条件 OR 构成。',['教材方程把 01 当无关项，不能声称它一定会安全恢复。','CMD2 为 1 可能来自 Q，或来自 P 且 Z=0，两项都要保留。'],checkpoint('本例 P=00 且 Z=0 时，下一状态码与输出是？',['11，CMD1=1,CMD2=0','10，CMD1=1,CMD2=1','00，CMD1=0,CMD2=0'],1,'P 的 Z=0 出口去 R=10，同时有状态输出 CMD1 和条件输出 CMD2。')),
 sec('l12-verilog','把 ASM 写进三部分模板，保留所有语义','15',[
 '状态寄存器完全沿用上一讲：异步低有效复位到 P，其他上升沿 state<=next。组合 case 的 P 分支直接翻译判断框 next=Z?Q:R，Q/R 都 next=P，default 也 next=P。ASM 的一条控制周期就对应一次当前 state 对组合逻辑的选择，不必为每个判断框建立新状态。',
 '输出由有效条件表达：CMD1=(state==P)；CMD2=(state==Q)||((state==P)&&!Z)。与简化位方程相比，状态等值比较加 default 可读性更高，还能明确未用码的输出。逻辑与/或适合这种单比特条件；若换成位向量，需重新区分逻辑运算和按位运算的含义。',
 '核对时沿图走每条路径，把状态、输入、next、CMD1、CMD2 写成一行，与代码逐行比较。然后检查每个 next 分支都赋值、输出无遗漏、state 只有一个驱动、复位极性正确。后续总线交换系统只是把 CMD 换成 Rin/Rout，把 Z 换成 start 等状态输入，模板原则不变。'
 ],"module asm1(input clk,rst_n,Z,output CMD1,CMD2);\n localparam [1:0] P=2'b00,Q=2'b11,R=2'b10;\n reg [1:0] state,next;\n always @(posedge clk or negedge rst_n)\n  if(!rst_n) state<=P; else state<=next;\n always @(*)\n  case(state)\n   P: next=Z?Q:R;\n   Q: next=P;\n   R: next=P;\n   default: next=P;\n  endcase\n assign CMD1=(state==P);\n assign CMD2=(state==Q) | ((state==P) & !Z);\nendmodule",'状态框译码产生 Moore 命令；条件框把当前输入加入组合输出；next 只接 D 端。',['不要把 Z 的判断写进新的 posedge Z 块。','增加判断状态会改变原 ASM 的周期数。'],checkpoint('ASM 的判断框 Z 在 Verilog 中最自然对应什么？',['另一个时钟域','组合 next=Z?Q:R','必须新增一个 TEST 状态'],1,'判断是当前周期的组合条件，直接生成次态选择。'))
 ],
 exercises:[
 choice('l12-e1','识别 ASM 的时间单位','l12-meaning','ASM 中保证对应一个时钟周期的是？',['每个判断框','每个状态框','每段连接线'],1,'状态框是一周期；判断和条件输出属于同一个 ASM 块。'),
 choice('l12-e2','区分 Moore 与 Mealy 命令','l12-symbols','P 下 Z=0 路径的圆角 CMD2 框表示？',['进入一个新的 CMD2 状态','CMD2 在 P 且 Z=0 时有效','CMD2 必须延迟两周期'],1,'它是当前状态中的条件输出，属于 Mealy。'),
 fill('l12-e3','五个状态需要多少 one-hot 位','l12-encoding','填写 5 态 one-hot 状态寄存器位宽。','localparam STATE_WIDTH = ___;',['5'],'localparam STATE_WIDTH = 5;','one-hot 每个抽象状态一个触发器，因此是 5 位。'),
 coding('l12-e4','由二进制状态表求次态与命令','l12-equations','仅测试合法 state=0(P)、3(Q)、2(R)，Z=0/1。P 的 Z=1 去 Q，Z=0 去 R；Q/R 回 P；CMD1 仅 P；CMD2 在 Q 或 P且Z=0。',"module top(input [1:0] state,input Z,output [1:0] next,output CMD1,CMD2);\n assign next=2'd0;\n assign CMD1=1'b0;\n assign CMD2=1'b0;\nendmodule","module top(input [1:0] state,input Z,output [1:0] next,output CMD1,CMD2);\n assign next=(state==2'd0)?(Z?2'd3:2'd2):2'd0;\n assign CMD1=(state==2'd0);\n assign CMD2=(state==2'd3) | ((state==2'd0) & ~Z);\nendmodule",[port('state',2),port('Z')],[port('next',2),port('CMD1'),port('CMD2')],[0,3,2].flatMap(state=>[0,1].map(Z=>vec({state,Z},{next:state===0?(Z?3:2):0,CMD1:state===0?1:0,CMD2:state===3||(state===0&&!Z)?1:0}))),'逐行检查当前输出和下一状态，不把 CMD2 错推迟到 R。',['先列 P 的两行，再列 Q/R 的无条件两行。'],3),
 coding('l12-e5','one-hot 入边直接形成方程','l12-equations','state[2:0] 合法码为 P=100,Q=010,R=001。实现 next：P 根据 Z 去 Q/R，Q/R 回 P；输出 CMD2 在 Q 或 P且Z=0。',"module top(input [2:0] state,input Z,output [2:0] next,output CMD2);\n assign next=state;\n assign CMD2=1'b0;\nendmodule","module top(input [2:0] state,input Z,output [2:0] next,output CMD2);\n assign next={state[1] | state[0],state[2] & Z,state[2] & ~Z};\n assign CMD2=state[1] | (state[2] & ~Z);\nendmodule",[port('state',3),port('Z')],[port('next',3),port('CMD2')],[4,2,1].flatMap(state=>[0,1].map(Z=>vec({state,Z},{next:state===4?(Z?2:1):4,CMD2:state===2||(state===4&&!Z)?1:0}))),'次态 P 位由 Q/R 入边 OR，次态 Q/R 位由 P 分支条件给出。',['拼接从高位到低位依次是 nextP、nextQ、nextR。'],3),
 fill('l12-e6','补齐条件输出路径','l12-symbols','one-hot P/Q 表示当前是否在该状态。CMD2 在 Q 或 P且Z=0。','assign CMD2 = Q | (P & ___);',['~Z','!Z'],'assign CMD2 = Q | (P & ~Z);','条件框要求 Z=0，所以 P 路径必须与 Z 的反相相与。'),
 choice('l12-e7','判断框的真实硬件','l12-time','“判断框不耗额外周期”的准确含义是？',['没有任何传播延迟','组合门在当前周期计算，状态仍在边沿更新','判断永远不影响最高频率'],1,'组合逻辑有传播延迟，也会影响关键路径，只是没有额外状态周期。',[],2),
 choice('l12-e8','简化方程的适用范围','l12-equations','D(A)=~A 的推导把编码 01 作为 don\'t care。这意味着？',['01 一定会复位','只保证合法状态行为，非法态要另规定','任意输入 Z 都非法'],1,'无关项可用于化简，但并未给非法状态安全行为保证。',[],2)
 ]
};

const lesson13 = {
 id:13,title:'共享总线与寄存器交换系统',subtitle:'共用 Lecture12–13：本讲继续原文件第 16–36 页',sourceFile:'Lecture12-13_v3.pdf',sourcePages:36,available:true,
 summary:'把上一讲的 ASM 变成真实控制器：Rin/Rout、三态与多路选择器、临时寄存器、三步交换、控制与数据对齐。分别讨论教材移位序列器和命名状态 FSM，指出长 start、外部加载和 done 的精确协议边界。',
 objectives:['区分寄存器装入 Rin 与总线驱动 Rout','遵守共享三态总线单驱动约束并理解 x/z','按三个周期追踪 R2→R3、R1→R2、R3→R1','读懂 [1:3] 方向的 one-hot 移位控制','用 MUX 替代 FPGA 内部三态总线','设计命名状态控制器并定义 start、外部加载和完成时刻'],
 sections:[
 sec('l13-bus','总线是一组共享导线，Rin 和 Rout 做两件不同的事','16–17',[
 'n 位总线是一组并行共享的数据线。Rout=1 时某寄存器的输出缓冲器把 Q 驱动到总线上；Rin=1 时该寄存器在下个采样边沿把总线读入。Rout 只决定谁说话，Rin 决定谁听并保存；源寄存器不会因为驱动总线就自动被清空，目标也不会在边沿之前自动改变。',
 '第 17 页按一位画出装入路径：Rin 控制 D 端前的 2:1 MUX，选 bus 或反馈 Q。Rin=0 保持，Rin=1 装入；Rout 控制独立三态缓冲器，关断时输出 z，即高阻抗。z 不是逻辑 0，而是该驱动器暂不决定总线电平，允许别的源接管。',
 '三态共享总线必须保证任何时刻最多一个 Rout/Extern 有效。无人驱动会浮空，在数字仿真中表现为 z；两个驱动器写不同位值会产生冲突 x。多个接收寄存器同一边沿装入同一个有效总线值是允许的，禁止的是多个竞争源同时驱动，而不是多个目的地同时读取。'
 ],"// One register with a load enable:\nalways @(posedge Clock)\n if(Rin) Q <= Bus;\n// A separate tri-state output driver:\nassign Bus = Rout ? Q : {8{1'bz}};",'每位含输入保持 MUX、DFF 与输出三态缓冲器；Rin 管写入，Rout 管驱动，二者独立。',['z 表示高阻，不等于保存上次值。','多个目的地读取合法，一个总线上多个不同数据源竞争不合法。'],checkpoint('Rout=1,Rin=0 时该寄存器做什么？',['把 Q 驱动到总线且自身保持','从总线加载并清空 Q','总线输出固定 0'],0,'输出驱动与输入装载是独立控制，Rin=0 让自身保持。')),
 sec('l13-swap','一个共享总线如何用三步交换两个寄存器','18',[
 '本例要交换 R1、R2，只有一组总线，因此同周期只能把一个选定值送给所有接收者。假如先 R1→R2，R2 的旧值会丢；先 R2→R1 同样会丢 R1 的旧值。临时寄存器 R3 就用于保存会被覆盖的那一份，作用类似软件 temp，但这里每步明确对应一次硬件装入。',
 '课件固定顺序：T1 让 R2out 与 R3in 有效，结束该周期时 R3←旧R2；T2 让 R1out 与 R2in 有效，结束时 R2←旧R1；T3 让 R3out 与 R1in 有效，结束时 R1←旧R2。每一步恰好一个源和一个目标，总线从未需要承载两个不同值。',
 '“必须三步”是对这套单共享总线及控制接口的结论。上一讲的 a<=b;b<=a 可以用直接交叉 D 线一拍交换，硬件连接资源不同，不能拿来否定本例时序。设计时间与数据通路资源是相互约束的，先确定允许哪些线和 MUX，再谈最少周期数。'
 ],"// End of T1: R3 <= R2;\n// End of T2: R2 <= R1;\n// End of T3: R1 <= R3;\n// One shared bus supplies the RHS in each cycle.",'一个临时寄存器保留旧 R2，三个周期复用同一总线；并非三个操作可以在该单总线架构中同时独立传输。',['不要在保存旧 R2 前覆盖 R2。','三周期约束依赖单总线架构，不是 Verilog 语言的限制。'],checkpoint('交换的第一个传输应是？',['R1→R2','R2→R3','R3→R1'],1,'先用临时寄存器保存 R2，后续才能覆盖 R2。')),
 sec('l13-sequencer','移位序列器：一颗 1 走过三个位就是三步控制','19–20、23',[
 '教材控制器不是显式 state/next，而是三位移位寄存器 Q[1:3]。复位为 000；w 只高一个周期后，依次形成 100、010、001、000。注意这个向量左端索引是 1：3\'b100 代表 Q[1]=1，不是 Q[3]=1。Q[1] 对应 T1，Q[2] 对应 T2，Q[3] 对应 T3。',
 'for(k=m;k>1;k=k-1) Q[k]<=Q[k-1]; Q[1]<=w; 的所有右侧都读旧值，因此 1 每边沿只前进一级。循环本身不消耗 m 个周期；需要三个周期是因为数据状态通过触发器逐级存储。它是带全零 Idle 的三步 one-hot 序列器，不是所有状态都严格一位为 1 的标准 four-state one-hot 编码。',
 '教材移位器每个周期都接收 w，若 w 连续高两拍，会产生 110 等多 1 状态，三态版本可能同时打开两个 Rout。第 20 页 ASM 却只在 Idle 测试 w，忙碌时忽略新请求。这是两种控制器的协议差别，不应说它们对任意 w 波形完全等价；教材版本必须由外部保证单周期启动。'
 ],"module shiftr #(parameter m=3)(input clk,rst_n,w,\n output reg [1:m] Q);\n integer k;\n always @(posedge clk or negedge rst_n)\n  if(!rst_n) Q<=0;\n  else begin\n   for(k=m;k>1;k=k-1) Q[k]<=Q[k-1];\n   Q[1]<=w;\n  end\nendmodule",'三只串接 DFF，把一拍启动脉冲变成三拍互斥控制；全零是空闲。',['连续高两拍不是“交换两次”这么简单，中间会出现并行控制冲突。','[1:3] 的位序必须从声明判断。'],checkpoint('Q[1:3]=3\'b100 时哪一位为 1？',['Q[1]','Q[2]','Q[3]'],0,'声明的左端是 Q[1]，字面量最左位对应它。')),
 sec('l13-modules','层次集成：regn、trin、shiftr 与顶层连线','21–24',[
 '第 21–24 页把整个系统拆成 regn×3、trin×4、shiftr×1 与顶层 swap。regn 使用 Rin 使能在边沿装入；trin 用 assign F=E?Y:{n{1\'bz}} 产生驱动或高阻；shiftr 产生三步控制。宽度参数 n 可覆盖，控制器 m 被顶层设成 3；命名参数 #(.m(3)) 比隐藏的 defparam 更容易追踪。',
 '顶层将 Q[1] 连接 R2out/R3in，将 Q[2] 连接 R1out/R2in，将 Q[3] 连接 R3out/R1in。RinExt 又与对应装入信号 OR，允许外部 Data 初始化寄存器：Extern=1，选择 RinExt，下一边沿装入。多个 trin 输出连接同一 tri net，在真实设计里必须由控制保证互斥。',
 '这段教材数据寄存器本身没有 reset，只有控制寄存器被清零。仿真启动时 R1/R2/R3 因此可能为 x，必须先加载再使用；不能因为图例为了清楚从 00 开始，就声称所有数据寄存器复位成零。外部 Extern/RinExt 也应在空闲初始化阶段使用，操作中随意插入会改变数据或造成总线冲突。'
 ],"// Textbook glue logic, Q declared [1:3]:\nassign Rin[1]=RinExt[1] | Q[3];\nassign Rin[2]=RinExt[2] | Q[2];\nassign Rin[3]=RinExt[3] | Q[1];\nassign Rout[1]=Q[2];\nassign Rout[2]=Q[1];\nassign Rout[3]=Q[3];",'顶层只负责模块间端口连接；Q 的位值译成目标 Rin 与源 Rout，再由总线传输真实数据。',['控制复位不等于所有数据寄存器都复位。','RinExt 与 Extern 不是可任意在交换中乱改的普通数据。'],checkpoint('教材 regn 没有复位，刚启动的 R1 应如何处理？',['默认一定是 0','使用前明确装入已知数据','把 wire 改 reg 即可初始化'],1,'Verilog 仿真未初始化存储是 x；设计协议应保证先加载再使用。')),
 sec('l13-waveform','沿边沿追踪：55 与 AA 到底何时交换完成','25、28–29',[
 '先在 Idle 把 Data=55、RinExt=100 保持到一个边沿，R1 才得到 55；再 Data=AA、RinExt=010 到边沿，R2 才得到 AA。MUX 总线空闲选外部 Data，因此加载阶段不需启动交换。所有数值是十六进制，55=01010101，AA=10101010，适合观察每位是否交换正确。',
 '单拍 w 被采样后进入 T1，当前周期总线=R2=AA，而 R3 要等结束 T1 的边沿才装入 AA；接着 T2 总线=R1=55，结束时 R2=55；再 T3 总线=R3=AA，结束时 R1=AA。控制 state 在边沿更新，数据寄存器按边沿前状态决定本次动作，所以不能把刚进入 T1 的边沿误当成 T1 传输已经完成。',
 '三态版本 Idle 无驱动可见 z，MUX 版本 Idle 总线为 Data，但只要 Rin 不使能，两者数据寄存器都保持。验证应同时检查状态、总线、Rin 与边沿后寄存器，而不只看最终值；最终偶然正确可能掩盖中途多驱动、错误装载或控制脉冲宽度不合协议。'
 ],"// Starting R1=8'h55, R2=8'hAA:\n// during T1: bus=AA; ending edge: R3=AA\n// during T2: bus=55; ending edge: R2=55\n// during T3: bus=AA; ending edge: R1=AA\n// after T3 completes: R1=AA, R2=55",'每周期组合总线先稳定，结束该周期的边沿将值装入目标寄存器；状态更新与数据动作都读取旧状态。',['“进入 T1”与“完成 T1 传输”是不同边沿。','空闲总线值可不同，不代表寄存器一定变化。'],checkpoint('T2 周期开始时 R1=55,R2=AA,R3=AA。结束 T2 后哪个变化？',['R1 变 AA','R2 变 55','R3 变 55'],1,'T2 的源是 R1、目标是 R2，结束边沿 R2 装入 55。')),
 sec('l13-mux','FPGA 内部总线：选择器比三态更合适','26–27、30',[
 '课件指出 FPGA 内部逻辑通常不提供任意片内三态缓冲，内部共享数据通路会由工具实现成多路选择器；三态主要用于器件 I/O 引脚等场景。MUX 总线只有一个组合输出驱动 BusWires，选 Data、R2、R1 或 R3，不再把多个独立输出并接到同一内部网。',
 'swapmux 在 Q=000 时选 Data，100 时选 R2，010 时选 R1，其余分支选 R3。最后 else 保证所有编码都有赋值，因此不会因遗漏产生 latch；但对 110 等非法 Q 它只是被优先选择为某个源，并没有修复原控制器多 1 导致多个 Rin 同时有效的问题。单驱动解决电气冲突，不自动解决协议错误。',
 '三态总线无人驱动可浮空、多源冲突可为 x；MUX 总线始终有确定驱动，不会出现同样的并接竞争。二者在合法控制序列下可保持相同数据传输时序。比较时要保留条件：硬件资源、非法态行为、空闲输出不同，不是把所有三态语义简单删除就完全等价。'
 ],"always @(*)\n if(Q==3'b000) BusWires=Data;\n else if(Q==3'b100) BusWires=R2;\n else if(Q==3'b010) BusWires=R1;\n else BusWires=R3;",'四选一 MUX 是总线唯一驱动；所有寄存器 D 仍由 Rin 控制装入。',['最后 else 避免 latch，但不代表非法 Q 得到安全控制。','内部 MUX 单驱动与外部 I/O 三态用途不同。'],checkpoint('用 MUX 替代三态后，长 w 导致的非法控制是否自动完全解决？',['是，所有错误都消失','否，虽无总线并接冲突，多个装入使能仍可能破坏数据','MUX 会自己复位所有寄存器'],1,'数据选择和装入控制是不同部分，控制协议还需单独修正。')),
 sec('l13-clean','命名状态 FSM：定义 start、外部加载和 done 的契约','31–33',[
 '清晰版本使用 IDLE、T1、T2、T3 四态：IDLE 看 start；T1→T2→T3→IDLE。只在 IDLE 响应 start，忙碌期间的新高电平不会把多颗 1 注入序列器。若 start 一直保持到重新回 IDLE，则随后仍会启动下一次交换，因此它不是自动边沿检测器；需要“一次按住只触发一次”时应加握手或边沿捕获。',
 '总线 case 在 T1 选 R2、T2 选 R1、T3 选 R3、默认选 Data；数据寄存器 case 在对应边沿分别写 R3、R2、R1。外部 RinExt 仅在 IDLE 处理，避免交换中随意插入装载。这把控制状态、数据选择、目标写入三个角色分清，阅读代码可以直接对照传输表。',
 '课件 done=(state==T3) 表示“当前正在最后一步”，真正 R1 写回发生在结束 T3 的边沿。若外部按边沿握手，可把 done 看成该边沿将完成的标志；若希望 done 一拉高数据已经全部完成，就应在 T3 结束后注册完成脉冲或增加 DONE 状态。完成信号的定义必须与观察时刻一起写清。'
 ],"// Controller (state register omitted here):\nalways @(*)\n case(state)\n  IDLE: next=start?T1:IDLE;\n  T1: next=T2;\n  T2: next=T3;\n  default: next=IDLE;\n endcase\nassign done=(state==T3); // final transfer is in progress\n// Register actions at ending edges: T1 R3<=bus; T2 R2<=bus; T3 R1<=bus;",'四态 FSM 输出总线选择与装入信号；数据通路是三寄存器加一个 MUX；done 的组合译码标记 T3 周期。',['start 在忙碌时忽略，但若跨回 IDLE 仍高会再启动。','done=T3 的高电平期间，最后写回尚待该周期结束边沿。'],checkpoint('done=(state==T3) 刚变 1 时，最准确的含义是什么？',['全部寄存器写回已在上一拍完成','当前最后一步进行中，结束此周期的边沿才完成写回','系统进入永久停止'],1,'T3 的 R1<=bus 在结束 T3 的边沿执行。')),
 sec('l13-practice','从 HDLBits 热身到系统验证：同时测试正常和违规刺激','34–36',[
 'Fsm1 的 A/B 是 Moore 两态，in=0 切换、in=1 保持，异步高有效复位到 B。Fsm2 用 OFF/ON 与 j/k 构成 JK 行为：OFF 遇 j=1 去 ON，ON 遇 k=1 去 OFF，复位到 OFF。先各画状态框和判断框，再写三部分模板；注意这里 areset 是高有效，与课堂 Resetn 相反。',
 '系统 testbench 先完成数据初始化，再给单拍启动，依次观察 T1/T2/T3 与三次写入，最后断言 R1=AA,R2=55。再测试 w 高两拍以揭示教材序列器协议问题；对改良 FSM 则测试忙碌期间 start，以及一直高到回 IDLE 时的再次启动。测试要针对控制器实际承诺，不把不同协议混用。',
 '课后 Fsm3comb、Fsm3onehot、Fsm3 分别帮助练组合次态、one-hot 方程和完整 FSM。本站组合练习把 current state 当显式输入，以真值表检查 next/control；完整交换系统仍需事件驱动仿真确认时钟、初始化、x/z、三态竞争与多周期数据路径。这种分层验证让错误能定位到公式还是时序连接。'
 ],"// Example system checks, in a full Verilog testbench:\n// 1) load R1=55, load R2=AA\n// 2) pulse start for one cycle\n// 3) check T1/T2/T3 controls and ending-edge register values\n// 4) after completion, require R1==AA && R2==55\n// 5) test long start under the documented protocol",'小题验证控制组合函数，系统仿真验证寄存器与总线的跨周期协作；两种证据互相补充。',['不能只验证最后值而不看驱动互斥。','HDLBits 的复位态与极性必须按各题说明，不要统一背成 A/低有效。'],checkpoint('Fsm1 的题目指定异步高有效复位到 B，正确做法是？',['因为课堂习惯仍复位到 A','posedge areset 生效时装入 B','不需要复位'],1,'练习规格优先：同时核对极性、边沿和复位目标状态。'))
 ],
 exercises:[
 choice('l13-e1','源与目的地','l13-bus','一个共享总线周期中，以下哪项通常合法？',['两个不同数据源同时强驱动','一个源驱动、多个目的寄存器同时装入','把 z 当成稳定 0 读取'],1,'多目标可复制同一份总线数据，源驱动仍需互斥。'),
 fill('l13-e2','交换的临时保存','l13-swap','按课件三步交换，第一步先保存旧 R2 到哪里？','T1: ___ <= R2;',['R3'],'T1: R3 <= R2;','R3 是临时存储，避免下一步覆盖 R2 丢失数据。'),
 choice('l13-e3','长 w 的序列器后果','l13-sequencer','教材移位控制器从 000 开始，w 连续高两拍会出现哪种危险？',['Q 会保持 000','出现 110 等多 1 控制，可能多源驱动','自动等待上一交换完成'],1,'移位器每拍都接收 w，不像显式 FSM 只在 IDLE 接受启动。'),
 coding('l13-e4','修复总线选错源','l13-mux','Q=000/100/010/001 时应分别选择 Data/R2/R1/R3。测试只使用这四个合法 Q；修复 T1/T2 选反的问题。',"module top(input [2:0] Q,input [7:0] Data,R1,R2,R3,output [7:0] bus);\n assign bus=Q==3'b000 ? Data:(Q==3'b100 ? R1:(Q==3'b010 ? R2:R3));\nendmodule","module top(input [2:0] Q,input [7:0] Data,R1,R2,R3,output [7:0] bus);\n assign bus=Q==3'b000 ? Data:(Q==3'b100 ? R2:(Q==3'b010 ? R1:R3));\nendmodule",[port('Q',3),port('Data',8),port('R1',8),port('R2',8),port('R3',8)],[port('bus',8)],[0,4,2,1].flatMap(Q=>[{Data:17,R1:85,R2:170,R3:204},{Data:0,R1:7,R2:8,R3:9}].map(d=>vec({Q,...d},{bus:Q===0?d.Data:Q===4?d.R2:Q===2?d.R1:d.R3}))),'T1 保存 R2 到 R3，故源应 R2；T2 才从 R1 送到 R2。',['把 Q 与传输表逐一连线，不按数字大小猜源。'],2,'debug'),
 coding('l13-e5','命名状态 FSM 的组合控制','l13-clean','state=0/1/2/3 代表 IDLE/T1/T2/T3。IDLE 看 start，否则依次走 1→2→3→0；done 在当前 T3 为 1。仅验证组合 next/done。',"module top(input [1:0] state,input start,output [1:0] next,output done);\n assign next=state;\n assign done=1'b0;\nendmodule","module top(input [1:0] state,input start,output [1:0] next,output done);\n assign next=state==2'd0 ? (start?2'd1:2'd0):(state==2'd1 ? 2'd2:(state==2'd2 ? 2'd3:2'd0));\n assign done=state==2'd3;\nendmodule",[port('state',2),port('start')],[port('next',2),port('done')],Array.from({length:8},(_,i)=>{const state=i>>1,start=i&1;return vec({state,start},{next:state===0?(start?1:0):(state+1)%4,done:state===3?1:0});}),'start 只影响 IDLE 分支，忙碌时不改变既定三步序列。',['done 是 T3 正在进行的标志，不是独立 DONE 状态。']),
 choice('l13-e6','先后边沿判断','l13-waveform','刚进入 T1 时，总线已选 R2。R3 何时装入 R2？',['进入 T1 之前','结束 T1 的下个上升沿','必须等待额外三个空周期'],1,'所有时钟块读取边沿前状态；本次刚入 T1，T1 的装入发生在该状态周期结束时。',[],2),
 fill('l13-e7','三态关断值','l13-bus','关闭三态缓冲器时每位应输出什么四值逻辑符号？',"assign bus = en ? data : {8{1'b___}};",['z','Z'],"assign bus = en ? data : {8{1'bz}};",'z 是高阻态，让开总线；不是数值 0。'),
 choice('l13-e8','done 的协议边界','l13-clean','done=(state==T3) 期间，最后一步 R1<=bus 什么时候完成？',['T3 结束边沿','done 拉高前已完成','只有 start 再高一次才完成'],0,'done 在这里表示最后一步进行中；若要求拉高时数据已完成，应改成注册完成事件。',[],2),
 choice('l13-e9','持续 start 会不会重启','l13-clean','改良 FSM 忙碌时忽略 start。如果 start 一直高到返回 IDLE 后，会发生什么？',['永远忽略，必须先复位','下次在 IDLE 采样时可能再启动','会在 T2 直接回 T1'],1,'只在 IDLE 响应不是边沿检测；持续有效请求可能在回到 IDLE 后再次被接受。',[],3)
 ]
};

const lesson14 = {
 id:14,title:'计算机体系结构：从总线系统走向 CPU',subtitle:'共用 Lecture14–15：本讲按主题阅读原文件第 3–20 页',sourceFile:'Lecture14-15.pdf',sourcePages:38,available:true,
 summary:'原课件是 38 页的 14–15 合并材料。第 14 讲聚焦体系结构、ISA、抽象层、机器码、五大部件与指令周期；第 15 讲继续性能计算。MIPS 是这份材料的教学 ISA，不把示例汇编误当作 Verilog，也不声称本讲已实现完整 CPU。',
 objectives:['把交换系统的控制/数据通路分工迁移到处理器','区分 ISA 接口与组织实现以及芯片设计角色','追踪 C→汇编→二进制机器码的转换','读取 MIPS add、lw、sw 的字段与字节偏移','解释五大部件及取指、译码、执行、写回的协作','把指令字段连到 Verilog 切片、地址加法器和选择器'],
 sections:[
 sec('l14-bridge','交换控制器就是处理器控制的缩影','1–4',[
 '交换系统已有控制器与数据通路：FSM 决定 T1/T2/T3，R1/R2/R3 和总线执行移动。处理器延续相同分工，控制器读取和译码指令，决定本周期哪些寄存器读写、ALU 做什么、是否访问存储器。不同之处在于启动不再只有一个 start，而是存储器中一条接一条的程序指令。',
 '数据通路从三个寄存器扩充成寄存器堆、ALU、地址加法器、移位器和 MUX；存储器同时承载程序和数据。指令不是来自软件世界的神秘动作，它也是一串位，接到译码电路后形成控制信号。把“add 指令”追到门电路，最终就是选择源操作数、执行加法、使能目的寄存器写入。',
 '第 4 页列出后续路线：架构与性能、指令集、Verilog 处理器、流水线。当前课程目标是 32 位、单核、单发射处理器，但这两讲只是建立接口和性能概念，不能把几个组合练习称为已经完成 CPU。理解控制/数据分工是后续实现的重要前提。'
 ],"// A tiny datapath fragment, not a complete processor:\nassign alu_result = a + b;\nassign write_data = select_memory ? memory_data : alu_result;\n// A controller would decode instruction bits and drive select_memory/write_enable.",'译码 FSM 产生控制；寄存器、ALU、MUX 搬运与计算数据；程序存储器提供新的命令位串。',['CPU 控制器并不替代 ALU，二者职责不同。','讲解一个数据通路片段不等于已验证完整处理器。'],checkpoint('CPU 中决定“这周期执行加法还是写存储器”的主要部件是？',['控制器','输出显示器','仅靠数据寄存器自身'],0,'控制器译码指令并发出控制信号，数据通路执行对应动作。')),
 sec('l14-terms','位宽、核心、发射宽度与制程是不同维度','5–7',[
 '第 5 页区分架构师、前端数字工程师、后端工程师与制造工程师。架构师规定指令、流水线和寻址等；前端用 RTL 实现并验证；后端处理布局布线、时序与功耗；制造把版图落实到工艺。写对 Verilog 功能只是完整芯片流程中的一环，不能据此推出实际频率或功耗。',
 'CPU、GPU、NPU/TPU 是面向不同任务的处理器类别，SoC 则把多个处理模块与控制器集成到一片芯片。课件用“少量复杂 CPU 核”和“许多并行 GPU 运算单元”建立直觉；这不是所有产品都遵循的精确数量标准，也不意味着 GPU 上任何程序都会自动更快，算法并行性与数据搬移同样重要。',
 '32/64 位主要描述 ISA 与实现中的寄存器、数据或地址能力，不能直接等同于每条指令长度；MIPS 教学指令固定 32 位，而 64 位数据 ISA 也可以使用 32 位指令。单核/多核描述完整处理核心数，单发射/多发射描述每周期发起指令的能力。制程名称是工艺代际标签，不能当作所有晶体管特征尺寸的精确测量值。'
 ],"// Data width and instruction width are separate choices.\nwire [31:0] instruction;\nwire [31:0] operand_a,operand_b;\n// A different ISA may have 64-bit operands with 32-bit instruction encodings.",'数据总线位宽、指令译码位宽、并行执行单元数量是独立硬件配置。',['64 位不等于每条指令必须 64 位。','单发射不等于任何指令都恰好一个周期完成。'],checkpoint('“32 位、单核、单发射”三个标签分别描述什么？',['三者都只描述时钟频率','数据/寄存器能力、处理核心数、每周期发起指令能力','指令长度、存储容量、制程'],1,'这三个维度不同，不能互相替代，也不能单独决定程序性能。')),
 sec('l14-isa','ISA 是约定能做什么，组织决定怎样实现','8、13–15',[
 'ISA 是软件能观察并依赖的硬件接口：有哪些操作、多少架构寄存器、指令如何编码、怎样找到数据、出现异常怎么办。machine organization 是实现这些约定的方式：加法器结构、流水线、缓存、每条指令的周期数等。两个处理器可以遵守相同 ISA，却用不同电路和时序实现。',
 '第 13 页用 MIPS 举例：add/sub/lw/sw/beq 是操作；32 位字段布局是格式；32 个架构寄存器与存储器是数据位置；4($2) 是基址加偏移寻址；overflow、illegal instruction 属于异常契约。汇编程序员应知道这些，却不必知道某块芯片使用哪一种串行或超前进位加法器。',
 'RISC/CISC 是设计风格的历史分类，课件用 MIPS 固定 32 位与 load/store 访问存储器来说明 RISC。不要把简化表推广成“所有 RISC 指令都固定长度、所有指令都一周期”；例如可变长度扩展与缓存未命中会改变情况。同一 ISA 的同一兼容二进制通常可在不同实现运行，但扩展、操作系统 ABI 和运行环境仍需兼容。'
 ],"// ISA-visible instruction fields vs implementation signals:\nwire [5:0] opcode = instruction[31:26];\nwire [4:0] rs = instruction[25:21];\n// Cache sizes, pipeline depth and adder structure are implementation choices.",'ISA 字段接到译码器；同一字段含义可由不同数据通路组织实现。',['不能仅凭 ISA 相同就忽略扩展和软件运行环境。','RISC 不意味着所有动态执行都恰好 1 cycle。'],checkpoint('以下哪项属于组织实现，而不是架构 ISA 的必要规定？',['add 指令字段含义','架构寄存器编号','缓存容量与流水线深度'],2,'缓存与流水线通常是实现选择；指令可见字段与寄存器编号属于软件接口。')),
 sec('l14-machine','从 C 到机器码：指令位串如何成为控制输入','9–10',[
 '高级语言 a=b+c 经编译器映射为指令，再由汇编器编码成二进制。假设 a/b/c 放在 $1/$2/$3，MIPS add $1,$2,$3 的字段为 op=000000、rs=00010、rt=00011、rd=00001、shamt=00000、funct=100000。不是把“add”几个字符放进电路，而是把这 32 个位交给译码逻辑。',
 '字段宽度相加是 6+5+5+5+5+6=32。rs、rt 指定两个源寄存器，rd 指定结果目的地；op 与 funct 一起说明操作类型，shamt 为移位量字段，在这条 add 中为 0。Verilog 用 instruction[25:21] 等切片取出字段，本质只是连线，不需要为拆位额外分配时钟。',
 '第 10 页用两条 lw、两条 sw 交换数组相邻元素：$2 是 v[k] 的字节地址，32 位元素为 4 字节，因此 v[k+1] 的偏移是 4。lw 从存储器读入寄存器，sw 从寄存器写到存储器。机器码 8C4F0000 对应 lw $15,0($2)，8C500004 对应 lw $16,4($2)，两条 sw 分别是 AC500000、AC4F0004。'
 ],"module fields(input [31:0] instruction,\n output [5:0] opcode,funct,output [4:0] rs,rt,rd,shamt);\n assign opcode=instruction[31:26];\n assign rs=instruction[25:21];\n assign rt=instruction[20:16];\n assign rd=instruction[15:11];\n assign shamt=instruction[10:6];\n assign funct=instruction[5:0];\nendmodule",'32 根指令线按位分组接到译码器和寄存器选择端；切片是导线映射。',['MIPS 汇编不是 Verilog：add 是 CPU 要解释的指令，不是 HDL 语句。','相邻元素偏移是字节数 4，而不是元素序号 1。'],checkpoint('lw $16,4($2) 中 4 的含义是？',['读取 4 号寄存器','在 $2 的地址上增加 4 字节','执行四次 load'],1,'MIPS 教学例按字节寻址，32 位 word 相邻距离 4 字节。')),
 sec('l14-software','软件分层为什么能隐藏海量硬件细节','11–12、16',[
 '高级语言让程序员表达算法而不必手写寄存器编号和位模式，编译器负责映射到目标 ISA。可移植通常表示源程序可在目标环境重新编译，不是同一机器二进制天然能跨任意 ISA 运行。高级语言一行也不保证只对应一条指令，编译优化、数据类型与调用约定都会影响生成代码。',
 '第 12 页的层次是应用、库、系统软件、硬件。应用面向用户任务，库复用经过测试的功能，操作系统管理程序与共享资源，编译器/汇编器构建可执行代码。实际系统可有更多层，但每一层给上层提供接口，使设计者不必同时追踪数十亿晶体管和完整应用逻辑。',
 '抽象不是忽略下层一切影响：性能与正确性问题仍可能迫使我们向下追踪。例如一条看似简单的数组语句可能触发多次 load/store，缓存与内存延迟又影响 CPU 时间。先在合适层次建立模型，需要解释差异时再打开下一层，是本课从 Verilog 电路走向体系结构的思维方式。'
 ],"// One source expression may need several instructions.\n// C: a = b + c;\n// Example path: load b; load c; add; store a.\n// Actual code depends on registers, compiler and target ISA.",'软件接口逐层隐藏硬件实现；最终机器指令仍会驱动寄存器读写、ALU 和存储器。',['源代码可重新编译不等于机器码跨 ISA 兼容。','库和操作系统并没有让硬件延迟消失，只是提供抽象接口。'],checkpoint('高级语言的可移植通常意味着什么？',['同一个机器码能在所有 CPU 执行','源代码适配目标环境并重新编译','不再需要 ISA'],1,'目标处理器仍执行自身 ISA，编译器把源程序映射到该 ISA。')),
 sec('l14-interface','接口与实现：同一个 MUX 可以有多种内部电路','17',[
 '第 17 页用 2:1 MUX 建立最小例子：接口只保证 S=0 时 Y=A，S=1 时 Y=B；内部可由 NAND/NOT 门实现，也可以写 assign Y=S?B:A，再由综合工具选择映射。使用这个模块的上层只需遵守端口意义与时序约定，不必复制内部结构细节。',
 'Verilog 的模块端口是接口，模块体是实现。但真实可复用接口还应包括位宽、符号、有效电平、何时采样、复位行为、是否有延迟和协议约束。仅给出 input/output 名字并不足以安全集成时序模块；交换系统的 start 单拍要求就是接口的一部分。',
 'ISA 将这种思想扩展到 CPU：软件看指令行为与编码，不必知道内部几级流水；硬件设计者可以改组织来提升性能，只要保持约定的可观察行为。验证时也应分层：组合模块可用真值表，时序接口需要周期协议，ISA 层需要程序状态与异常语义的符合性。'
 ],"module mux2(input A,B,S,output Y);\n assign Y=S?B:A;\nendmodule\n// Equivalent Boolean implementation:\n// assign Y=(~S & A) | (S & B);",'相同端口行为可映射为不同门网络；上层连线依赖接口约定，内部优化可独立进行。',['两个表达式功能等价不代表物理门延迟相同。','时序模块接口不应漏写采样边沿和启动协议。'],checkpoint('模块换用不同门级 MUX 实现，上层最应依赖什么？',['内部实例名称','端口功能与时序契约','实现代码行数'],1,'清楚的接口允许内部实现替换，同时保持上层行为。')),
 sec('l14-components','五大部件与 lw 的完整指令周期','18–20',[
 '五大部件是输入、输出、存储器、数据通路、控制；后两者合为处理器的核心职责。数据通路包含寄存器、ALU、加法器、移位器和 MUX，控制器据指令发出操作和装入信号。程序与数据都以位形式放在存储系统，处理器按指令意义区分它们的用途。',
 'lw $15,0($2) 可分六步理解：取指读取 8C4F0000；译码认出 load、基址寄存器 $2、目的 $15 与偏移 0；取操作数读 $2；执行计算地址并读存储器；结果存入 $15；选择下一条指令地址。对固定 32 位且按字节寻址的顺序 MIPS 指令，PC 通常加 4。分支/跳转需另一套 next-PC 选择。',
 '六步是逻辑职责，不表示所有 CPU 固定六个周期：单周期可把多步放在长周期内，多周期可用 FSM 分步，流水线可让不同指令重叠。当前讲义用“每步可对应 ASM 状态”连接之前的控制设计。地址加法器和 PC+4 可以在浏览器组合题验证，但存储器协议与寄存器写回仍需完整时序系统。'
 ],"// Address/PC combinational fragment (offset already sign-extended):\nassign effective_address = base + offset;\nassign sequential_pc = pc + 32'd4;\n// Control then sequences memory read and register write-back.",'基址与扩展偏移进入地址加法器；PC+4 是另一条加法路径；控制 FSM 决定何时读内存与写寄存器。',['六个逻辑步骤不等于每个实现必定六周期。','完整 lw 的 16 位偏移须符号扩展，不能总是零扩展。'],checkpoint('在本讲固定 32 位、按字节寻址的 MIPS 顺序执行中，下一 PC 通常是多少？',['PC+1','PC+4','PC+32'],1,'每条指令 32 位=4 字节，所以顺序地址间距是 4。'))
 ],
 exercises:[
 choice('l14-e1','ISA 还是组织','l14-isa','以下哪项最典型地属于 ISA？',['缓存容量','add 的指令编码与寄存器含义','物理布局位置'],1,'ISA 是软件可依赖的指令行为与编码接口。'),
 choice('l14-e2','位宽与指令长度','l14-terms','“64 位 CPU”的描述能否推出每条指令长 64 位？',['能，二者定义相同','不能，数据/寄存器能力与指令长度是不同约定','能，而且一定双发射'],1,'位宽、指令编码长度、发射宽度是不同维度。'),
 coding('l14-e3','从机器码接出字段导线','l14-machine','输入是 32 位 MIPS 指令。输出 opcode=31:26、rs=25:21、rt=20:16、immediate=15:0。只拆字段，不尝试执行指令。',"module top(input [31:0] instruction,output [5:0] opcode,output [4:0] rs,rt,output [15:0] immediate);\n assign opcode=6'd0;\n assign rs=5'd0;\n assign rt=5'd0;\n assign immediate=16'd0;\nendmodule","module top(input [31:0] instruction,output [5:0] opcode,output [4:0] rs,rt,output [15:0] immediate);\n assign opcode=instruction[31:26];\n assign rs=instruction[25:21];\n assign rt=instruction[20:16];\n assign immediate=instruction[15:0];\nendmodule",[port('instruction',32)],[port('opcode',6),port('rs',5),port('rt',5),port('immediate',16)],[0x8c4f0000,0x8c500004,0xac500000,0xac4f0004,0x00430820].map(instruction=>vec({instruction},{opcode:(instruction>>>26)&63,rs:(instruction>>>21)&31,rt:(instruction>>>16)&31,immediate:instruction&65535})),'字段提取只改变连线分组，不需要时钟或状态。',['切片范围包含两端，例如 31:26 正好 6 位。']),
 fill('l14-e4','相邻 word 的偏移','l14-machine','数组每个元素 32 位，$2 指向 v[k]。v[k+1] 的字节偏移是多少？','lw $16, ___($2)',['4'],'lw $16, 4($2)','32 位=4 字节，按字节寻址时相邻 word 地址差为 4。'),
 coding('l14-e5','地址加法器与 PC+4','l14-components','base、offset、pc 都为 32 位，offset 已经符号扩展成 32 位补码。实现 address=base+offset，next_pc=pc+4，输出按 32 位截取。本题没有存储器或时序。',"module top(input [31:0] base,offset,pc,output [31:0] address,next_pc);\n assign address=base;\n assign next_pc=pc;\nendmodule","module top(input [31:0] base,offset,pc,output [31:0] address,next_pc);\n assign address=base+offset;\n assign next_pc=pc+32'd4;\nendmodule",[port('base',32),port('offset',32),port('pc',32)],[port('address',32),port('next_pc',32)],[vec({base:4096,offset:0,pc:1024},{address:4096,next_pc:1028}),vec({base:4096,offset:4,pc:1028},{address:4100,next_pc:1032}),vec({base:4096,offset:4294967292,pc:1032},{address:4092,next_pc:1036}),vec({base:4294967292,offset:4,pc:4294967292},{address:0,next_pc:0})],'32 位补码负偏移在模 2^32 加法中得到正确地址；若原偏移只有 16 位，必须先正确符号扩展。',['最后一个向量专门检查输出位宽回绕。'],2),
 choice('l14-e6','CPU 内部的职责','l14-components','寄存器堆、ALU 和 MUX 主要属于哪部分？',['数据通路','仅输入设备','汇编器'],0,'控制器发命令，数据通路保存与计算数据。'),
 fill('l14-e7','接口实现 MUX','l14-interface','S=0 选 A，S=1 选 B，填入选中时的数据输入。','assign Y = S ? ___ : A;',['B'],'assign Y = S ? B : A;','三目运算符问号后的第一项是条件为真时的结果。'),
 choice('l14-e8','指令周期与周期数','l14-components','把指令分成取指、译码等六步，是否意味着每种 CPU 都是六个时钟完成一条指令？',['是，所有架构强制如此','否，这是职责划分，具体周期取决于组织','否，因为 CPU 不需要时钟'],1,'单周期、多周期、流水线会把这些职责安排到不同时间结构中。',[],2),
 choice('l14-e9','高级语言可移植','l14-software','同一 C 源程序迁移到不同 ISA，通常需要什么？',['无需编译直接执行原机器码','为目标 ISA/环境重新编译并满足依赖','把程序扩展名改成 .v'],1,'源级可移植与二进制兼容是不同问题。')
 ]
};


const lesson15 = {
 id:15,title:'性能：时钟、CPI、Amdahl 与指标陷阱',subtitle:'共用 Lecture14–15：本讲继续原文件第 21–38 页',sourceFile:'Lecture14-15.pdf',sourcePages:38,available:true,
 summary:'从“究竟要多快”开始，分清响应时间、吞吐量、elapsed/CPU time，推导 IC×CPI×周期，并逐个重算课件实例。组合代码题把计数与比较公式做成可验证的计算电路，不冒充真实处理器 benchmark。',
 objectives:['按任务选择响应时间或吞吐量指标','正确使用执行时间倒数与加速比方向','统一 ps/ns/GHz 单位并计算周期数与 CPU 时间','按指令条数加权求 CPI，而非直接平均各类 CPI','分析算法、编译器与组织同时改变的因素','应用 Amdahl 上限并识别 GHz/CPI/IC/MIPS 单指标误导'],
 sections:[
 sec('l15-metric','先问快在哪里：响应时间、吞吐量与计时边界','21–24',[
 '第 21 页用飞机比较说明指标决定赢家：载客量、航程、速度、旅客×速度衡量的是不同目标。计算机同样如此，一次任务多久完成是响应时间，每单位时间完成多少任务是吞吐量。增加多个处理器、各跑独立任务可以提高吞吐量，却不保证某一个不能并行的任务更早结束。',
 '对同一固定工作，Performance=1/ExecutionTime。A 用 10s、B 用 15s，A 相对 B 的性能比是 15/10=1.5，不是 10/15。为了避免“快百分之多少”的口语歧义，最好明确写执行时间减少比例或性能倍数；时间从 15 到 10 减少 1/3，性能则提高 1/2。',
 'elapsed time 包括计算、I/O 等待、其他程序抢占等用户经历的全部时间；CPU time 只计该任务使用 CPU 的时间，包含 user CPU 与 system CPU。优化 CPU 算术可能缩短 CPU time，但若任务大半在等磁盘，墙钟收益会小得多。后面公式必须先说明计时边界与工作量固定。'
 ],"// For the SAME completed work:\n// performance_ratio_A_over_B = time_B / time_A\n// 15s / 10s = 1.5\n// CPU time = user CPU time + system CPU time",'性能是对完整系统行为的测量，不是某个门或频率标签；多核并行资源能改变吞吐与单任务时间的不同部分。',['不要把时间比方向写反。','不要用 CPU time 的改进直接替代用户 elapsed time 的改进。'],checkpoint('A 执行同一任务 10s、B 为 15s，A 相对 B 的性能是多少倍？',['0.67 倍','1.5 倍','5 倍'],1,'性能为时间倒数，所以比值是 15/10=1.5。')),
 sec('l15-clock','周期与频率：先算需要几次 tick，再算每次多长','25–27',[
 '时钟周期 Tc 是一拍的时长，频率 f 是每秒多少拍，两者互为倒数。250ps=250×10^-12s=0.25ns，f=1/Tc=4GHz。单位必须带入计算：GHz 是 10^9Hz，不能直接把数字 4 当作每秒 4 拍；ps、ns、s 也不能混在同一个未换算表达式里。',
 'CPUTime=ClockCycles×Tc=ClockCycles/f。要减少时间，可以减少周期数或缩短周期，但二者常互相影响，例如更深的流水线提高频率，分支和等待却可能增加周期数。只看频率增长百分比就等同于性能增长百分比，隐含了周期数不变的强假设。',
 '例 1：A 为 2GHz、10s，周期数是 20×10^9。B 虽想达到 6s，但需要 1.2 倍周期，即 24×10^9，因此必须 fB=24×10^9/6=4GHz。B 频率翻倍，性能却只提高到 10/6≈1.67 倍，多出的周期吃掉一部分收益。'
 ],"// Worked example 1:\n// cycles_A = 10s * 2e9 cycles/s = 20e9 cycles\n// cycles_B = 1.2 * 20e9 = 24e9 cycles\n// frequency_B = 24e9 cycles / 6s = 4e9 Hz",'频率来自寄存器间路径可承受的周期；程序总周期数来自执行组织和工作量，两个因素共同决定时间。',['4GHz 不是每条指令都 0.25ns 完成，指令可能多周期。','频率升高若同时增加周期数，收益必须重新算。'],checkpoint('250ps 的周期对应多少频率？',['0.25GHz','2.5GHz','4GHz'],2,'1/(250×10^-12)=4×10^9Hz。')),
 sec('l15-equation','IC、CPI、Tc：单位相消得到完整 CPU 时间','28–29',[
 'IC 是运行这项任务动态执行的指令数，不是源代码行数或可执行文件中的静态指令数；循环执行多次会重复计入。CPI 是平均每指令需要的周期，Tc 是每周期秒数。ClockCycles=IC×CPI，CPUTime=IC×CPI×Tc=IC×CPI/f，单位依次是 instruction、cycle/instruction、second/cycle，最终相消成 second。',
 '例 2 假定同一 ISA、同一程序与相同动态指令流，A 的 CPI=2、Tc=250ps，平均每指令 500ps；B 的 CPI=1.2、Tc=500ps，平均每指令 600ps。共同的 IC 可以约掉，A 更快 600/500=1.2 倍。B 的 CPI 更低并不足以抵消它的周期更长。',
 '“同一 ISA”本身不强制同一 IC，若编译器、二进制、算法、运行输入不同，指令数也可能变。比较时必须明确同一任务与实际指令流假设。比如 6×10^9 指令、CPI=1.5、3GHz，周期数 9×10^9，CPU 时间=3s；每一步都可用单位检查避免混算。'
 ],"// CPU_time = IC * CPI / frequency\n// Example: 6e9 * 1.5 / 3e9 = 3 seconds\n// Equal-IC comparison:\n// A: 2 * 250ps = 500ps/instruction\n// B: 1.2 * 500ps = 600ps/instruction",'IC 是工作映射，CPI 是组织与指令混合造成的平均代价，Tc 与硬件路径/技术相关。',['动态 IC 与静态程序长度不同。','同一 ISA 不足以保证不同编译结果的 IC 相同。'],checkpoint('同一指令流下 A:2×250ps，B:1.2×500ps，谁更快？',['A 快 1.2 倍','B 快 1.2 倍','两者一样'],0,'A 每指令 500ps，B 600ps；性能比是 600/500=1.2。')),
 sec('l15-mix','平均 CPI 必须按实际指令混合加权','30–31',[
 '不同类别可有不同周期代价，总代价是 Cycles=Σ(CPIi×ICi)，平均 CPI=Cycles/ΣICi。若占比 50%/30%/20% 的类别分别需要 1/2/3 周期，则平均为 0.5×1+0.3×2+0.2×3=1.7。简单计算 (1+2+3)/3=2 隐含各类数量相等，与实际混合不符。',
 '例 3 的序列 1 包含 A/B/C 类 2/1/2 条，CPI 为 1/2/3，合计 5 条、10 周期、平均 CPI=2。序列 2 是 4/1/1 条，合计 6 条、9 周期、平均 CPI=1.5。在同一时钟下，第二个序列虽然多一条指令，仍因少一个周期更快，加速比 10/9≈1.11。',
 '浏览器组合题把三个类别计数接到加法/移位网络，算出 instructions=a+b+c、cycles=a+2b+3c。这是一个计算统计结果的小电路，不是实际运行程序的 CPU。使用左移实现乘 2 时必须给足位宽，不能让 8 位计数器 255<<1 先截成 254 后再扩展。'
 ],"// Counts a,b,c are each 8 bits. Widen BEFORE shifting.\nassign instructions = {2'b00,a}+{2'b00,b}+{2'b00,c};\nassign cycles = {3'b000,a}+({3'b000,b}<<1)\n              +({3'b000,c}<<1)+{3'b000,c};",'计数统计电路用扩展连线、移位与加法计算加权周期；CPI 的除法是性能分析，不一定需要实现硬件除法器。',['平均 CPI 的权重是指令数量占比，不是任意平均。','移位前先扩位，避免中间结果截断。'],checkpoint('50% 类 CPI=1，30% 类 CPI=2，20% 类 CPI=3，平均 CPI 是？',['1.7','2.0','6.0'],0,'按占比加权求和：0.5+0.6+0.6=1.7。')),
 sec('l15-factors','优化不能只盯一个数字：三项乘积才是结果','32',[
 '第 32 页用单位形式重写 CPUTime=(Instructions/Program)×(Cycles/Instruction)×(Seconds/Cycle)。这种写法把算法、编译与硬件放到同一框架：改变任意一项都可能同时改变另一项，最终看完整乘积。它也说明“少几行源代码”不是可靠性能证据，因为源行数并非公式中的 IC。',
 '算法改变需要完成的动态工作，语言与编译器影响指令选择和混合，ISA 改变表达工作的方式，组织影响 CPI 与周期，制造技术影响可实现的时序。课件表格是常见影响方向，不是每种改变只能触碰被打勾的一项：例如编译布局可通过缓存行为间接改变 CPI。',
 '比较两个方案时先固定任务和输入，记录 IC、CPI、f 的变化，再用比值 Tnew/Told=(ICnew/ICold)×(CPInew/CPIold)×(fold/fnew)。如果 IC 降到 0.8 倍但 CPI 升到 1.5 倍且频率不变，时间变成 1.2 倍，反而慢 20%。单项改善不能替代端到端测量。'
 ],"// Same workload, compare all factors:\n// T_new / T_old = (IC_new/IC_old) * (CPI_new/CPI_old) * (f_old/f_new)\n// 0.8 * 1.5 * 1.0 = 1.2 => 20% more time",'算法、编译器与硬件共同影响执行工作与每步代价；相乘后才得到 CPU 时间。',['IC 减少 20% 不保证时间减少 20%。','性能倍数与时间变化百分比不能混用。'],checkpoint('IC 变成 0.8 倍、CPI 变成 1.5 倍、频率不变，时间变为多少？',['0.8 倍','1.2 倍','1.5 倍'],1,'时间比例是乘积 0.8×1.5=1.2，方案反而更慢。')),
 sec('l15-amdahl','Amdahl：未优化的部分给整体收益设上限','33–34',[
 '将原时间分成 affected 与 unaffected 两部分。若只把前者加速 n 倍，Tnew=Taffected/n+Tunaffected。用原时间占比 p 表示，则 Speedup=1/((1−p)+p/n)。p 必须按优化前的执行时间定义，不能拿优化后占比或源代码行数比例代入。',
 '课件 100s 程序中乘法占 80s，其余 20s。想整体达到 5 倍就要总时间 20s，于是 20=80/n+20，任何有限 n 都做不到；即使乘法无限快，也只是趋近 5 倍上限。若只有 50% 的原时间可改，整体最多趋近 2 倍，所以不可能达到 3 或 4 倍。',
 '60% 部分加速 3 倍的课后例：新时间比例=0.4+0.6/3=0.6，整体加速=1/0.6≈1.67 倍。可视化曲线随着 n 增加会越来越平，不是线性上涨。这个模型假设其他部分时间不变且工作量固定；真实优化若改变并行开销或数据传输，应重新测量各部分。'
 ],"// Amdahl, for fixed work and unchanged remaining time:\n// speedup = 1 / ((1-p) + p/n)\n// p=0.6,n=3 => 1/(0.4+0.2)=1.6667\n// n -> infinity: ceiling = 1/(1-p)",'提升局部电路速度只有在程序真实使用该部分时才起作用；未受影响的时间最终占主导。',['局部加速 5 倍不是整体加速 5 倍。','上限通常是趋近值，有限 n 未必能正好达到。'],checkpoint('原程序一半时间可优化，即使这部分无限快，整体加速最多趋近？',['2 倍','3 倍','无限大'],0,'剩下 50% 不变，最短总时间为原来的一半，因此上限为 2。')),
 sec('l15-mips','MIPS 更高仍可能更慢：名字相同，含义不同','35',[
 '性能指标 MIPS 指每秒百万条指令，MIPS=IC/(Time×10^6)=f/(CPI×10^6)。它与 MIPS 指令集名称不是同一个概念。指令每秒数量不告诉你一条指令完成多少有效工作，也无法消除不同 ISA、编译器与程序的差异，因此不适合作为跨工作量的万能排序。',
 '课件在 1GHz 下比较两段完成同一工作代码：代码 1 含 5M/1M/1M 条 A/B/C，周期代价 1/2/3，总 7M 条、10M 周期、10ms、700MIPS；代码 2 含 10M/1M/1M，总 12M 条、15M 周期、15ms、800MIPS。后者每秒指令更多，却花更长时间。',
 '这个反例与“CPI 越低越好”的陷阱一致：改用更多廉价指令可能降低平均 CPI、提高 MIPS，但工作对应的总周期仍增加。评估应选择固定工作量的执行时间，必要时辅以吞吐、能耗等目标。报告 MIPS 或 GHz 时保留环境和指令流上下文，不能删掉影响结论的假设。'
 ],"// At 1 GHz:\n// code1 cycles=5M*1+1M*2+1M*3=10M => 10ms, 700MIPS\n// code2 cycles=10M*1+1M*2+1M*3=15M => 15ms, 800MIPS\n// code1 finishes the fixed work sooner.",'MIPS 反映指令吞吐，任务时间还取决于需要多少条、每条做多少有效工作。',['MIPS 性能单位与 MIPS ISA 名称无关。','不能单凭更高 MIPS 宣布相同任务更快。'],checkpoint('同一工作代码 1 为 10ms/700MIPS，代码 2 为 15ms/800MIPS，谁完成更快？',['代码 1','代码 2','MIPS 高的必快'],0,'固定工作量比较执行时间，10ms 比 15ms 短。')),
 sec('l15-review','复算与自检：先列假设，再看单位，最后比较时间','36–38',[
 '最后几页把高频错误放在一起：性能比倒置、只比较频率、只比较 CPI、只看 IC、期望局部加速按比例传到全局、把 ps/ns/GHz 混用。可以统一用三步修正：写同一任务与计时范围，列出 IC/CPI/f 或周期数，换成秒再比较；需要相对性能时最后再取倒数比。',
 '课后题 1：20s×2GHz=40×10^9 周期。题 2：6×10^9×1.5/3GHz=3s。题 3：60% 浮点部分加速 3 倍，整体=1/(0.4+0.6/3)=5/3。每个结果都能反向代回原式检查：40×10^9/2×10^9=20s；3s×3GHz=9×10^9 周期。',
 '从整个课程看，前半部分教“代码构成什么电路”，本讲补上“电路做完同一任务需要多久”。组合算术通过向量只能证明给定函数的结果，不提供实际综合频率、功耗或 CPU benchmark；这些需要完整实现、约束和测量。下阶段再把寄存器/状态机/总线与 ISA 汇合成可执行处理器。'
 ],"// Unit-first checklist:\n// 1) fixed workload + CPU/elapsed timing boundary\n// 2) cycles=IC*CPI, seconds=cycles/frequency\n// 3) performance ratio=time_reference/time_candidate\n// Practice answers: 40e9 cycles; 3s; 5/3 overall speedup",'门级延迟决定可行时钟，微结构与程序决定周期总数；功能正确与性能达标需要不同验证证据。',['浏览器立即输出不代表实际 FPGA 可以无限频率运行。','课件中的未来 CPU 目标不是本节组合题已经实现的能力。'],checkpoint('20s、2GHz 对应多少 CPU 周期？',['40×10^9','10×10^9','40×10^6'],0,'周期数=秒×每秒周期数=20×2×10^9。'))
 ],
 exercises:[
 choice('l15-e1','性能比的方向','l15-metric','同一任务 A 为 10s、B 为 15s，A 是 B 性能的多少倍？',['2/3','1.5','5'],1,'性能比为 TimeB/TimeA=15/10=1.5。'),
 fill('l15-e2','GHz 与周期换算','l15-clock','时钟周期 250ps 对应多少 GHz？','clock_rate_GHz = ___;',['4','4.0'],'clock_rate_GHz = 4;','250ps=0.25ns，倒数为 4GHz。'),
 fill('l15-e3','计算 CPU 时间','l15-equation','6×10^9 条动态指令，CPI=1.5，频率=3GHz，时间为多少秒？','CPU_time_seconds = ___;',['3','3.0'],'CPU_time_seconds = 3;','总周期 9×10^9，除以 3×10^9 周期/秒得到 3 秒。'),
 coding('l15-e4','把加权周期公式做成组合电路','l15-mix','a,b,c 是三类 8 位无符号动态指令计数，代价分别为 1/2/3 周期。实现 instructions=a+b+c（10位），cycles=a+2b+3c（11位）。只计算统计量，不执行这些指令。',"module top(input [7:0] a,b,c,output [9:0] instructions,output [10:0] cycles);\n assign instructions=a+b+c;\n assign cycles=a+b+c;\nendmodule","module top(input [7:0] a,b,c,output [9:0] instructions,output [10:0] cycles);\n assign instructions={2'b00,a}+{2'b00,b}+{2'b00,c};\n assign cycles={3'b000,a}+({3'b000,b}<<1)+({3'b000,c}<<1)+{3'b000,c};\nendmodule",[port('a',8),port('b',8),port('c',8)],[port('instructions',10),port('cycles',11)],[[2,1,2],[4,1,1],[0,0,0],[0,0,1],[255,255,255],[0,255,0],[1,0,255]].map(([a,b,c])=>vec({a,b,c},{instructions:a+b+c,cycles:a+2*b+3*c})),'先扩宽，再移位或相加，最大周期数 1530 可由 11 位承载。',['2b 可用 b 左移 1；3c 可用 (c左移1)+c。','扩位应在移位前完成。'],3),
 coding('l15-e5','同 IC 的两台 CPU 谁更快','l15-equation','两台机器执行同一指令流。A 周期250ps，B周期500ps。输入 cpi_a,cpi_b 是 1…15 的整数。输出 a_faster 当 A 时间严格更短，tie 当时间相等；比较 cpi_a 与 2*cpi_b，注意扩位。',"module top(input [3:0] cpi_a,cpi_b,output a_faster,tie);\n assign a_faster=cpi_a<cpi_b;\n assign tie=cpi_a==cpi_b;\nendmodule","module top(input [3:0] cpi_a,cpi_b,output a_faster,tie);\n wire [4:0] scaled_b;\n assign scaled_b={1'b0,cpi_b}<<1;\n assign a_faster={1'b0,cpi_a}<scaled_b;\n assign tie={1'b0,cpi_a}==scaled_b;\nendmodule",[port('cpi_a',4),port('cpi_b',4)],[port('a_faster'),port('tie')],Array.from({length:225},(_,i)=>{const cpi_a=Math.floor(i/15)+1,cpi_b=i%15+1;return vec({cpi_a,cpi_b},{a_faster:cpi_a<2*cpi_b?1:0,tie:cpi_a===2*cpi_b?1:0});}),'IC 与共同的250ps因子约去，比较 CPIa 和2×CPIb；不能只比较 CPI 本身。',['cpi_b 最大15，乘2需要5位。'],3,'debug'),
 choice('l15-e6','更多指令为什么反而更快','l15-mix','同频率下，序列1为5条/10周期，序列2为6条/9周期，哪个更快？',['序列1，因为指令少','序列2，因为总周期更少','必然一样'],1,'同频率下时间正比总周期数；9周期比10周期短。',[],2),
 choice('l15-e7','Amdahl 的有限收益','l15-amdahl','原程序60%时间的部分加速3倍，其余不变。整体加速约为？',['3倍','1.67倍','5倍'],1,'新时间比例=0.4+0.6/3=0.6，倒数=1.6667。',[],2),
 choice('l15-e8','MIPS 反例','l15-mips','代码A完成同一工作需10ms/700MIPS，B为15ms/800MIPS，哪个结论正确？',['B更快，因为800>700','A更快，因为执行时间更短','不能比较任何时间'],1,'MIPS不能取代固定任务的执行时间；A性能是B的1.5倍。'),
 choice('l15-e9','三因素同时改变','l15-factors','IC降至0.8倍，CPI升至1.5倍，频率不变。时间如何变化？',['减少20%','增加20%','减少50%'],1,'时间比=0.8×1.5=1.2，比原来多20%。',[],2),
 choice('l15-e10','吞吐量与响应时间','l15-metric','给服务器增加独立处理器，每核运行一个独立任务，最直接改善什么？',['必然让单个串行任务耗时减半','可提高单位时间完成任务数','必然将CPU周期减半'],1,'多任务并行提高吞吐量；单任务响应时间需看任务能否并行和系统其他瓶颈。')
 ]
};

export const lateLessons = [lesson8,lesson9,lesson10,lesson11,lesson12,lesson13,lesson14,lesson15];
