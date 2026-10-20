/* 原创中文学习材料；pages 均为原课件 PDF 物理页码。
 * 可执行题限定二值连续赋值子集；时序及 X/Z 由概念题解释。 */
export const earlyLessons = [
  {
    "id": 1,
    "title": "从逻辑门走向可综合 HDL",
    "subtitle": "硬件描述、设计流程、并行性与三种电路表达",
    "sourceFile": "Lecture01.pdf",
    "sourcePages": 21,
    "available": true,
    "summary": "先建立正确的硬件思维：Verilog 描述互连与逻辑关系，仿真检查行为，综合把描述映射为门和寄存器。本课把同一个选择电路在逻辑式、门图与过程语句间来回翻译。",
    "objectives": [
      "区分规格、RTL、仿真、综合和物理实现",
      "解释结构描述与行为描述如何指向同一硬件",
      "理解 assign 的并行更新以及 always 内部的过程顺序",
      "把每条简单 Verilog 语句映射为输入、门、连线与输出"
    ],
    "sections": [
      {
        "id": "l1-journey",
        "title": "1.1 数字系统的抽象阶梯与本课位置",
        "pages": "2–6",
        "body": [
          "课件第 2 页把 EEE104、EEE205 与 EEE339 连成一条学习路线：从晶体管和基本逻辑，走到逻辑组合，再走向可描述、可验证、可综合的数字系统。EEE339 不只是再记几种逻辑门，而是把这些门组织成可重用模块，并逐渐组合为有限状态机和处理器。",
          "第 4–5 页把这种跨层思考称为抽象。规格层说明系统要完成什么，RTL 层说明数据如何变换、状态如何保存，门级说明需要哪些逻辑与连线；物理层才决定器件、布局和时序。写出更短的 HDL 不等于需要更少硬件，关键要问每个表达式允许综合工具构造什么。",
          "第 6 页给出从规格到硬件的流程：先规定输入输出与目标，再写 RTL，建立仿真和验证，再做逻辑综合、技术映射和物理实现。当前网页的组合逻辑练习只检查有限输入向量上的逻辑结果；它不能代替真实综合、布局布线和芯片时序签核。"
        ],
        "code": "// 规格：使能为 1 时让数据通过，否则输出 0\nmodule enable_path (data, enable, out);\n  input data, enable;\n  output out;\n  assign out = data & enable;\nendmodule",
        "hardware": "两个输入进入一个与门，输出是一条组合逻辑连线；模块没有时钟，也没有保存历史的状态。",
        "pitfalls": [
          "把 Verilog 当成由 CPU 按行执行的软件。",
          "只看仿真输出正确，就断言满足真实器件的时序或资源要求。"
        ],
        "check": {
          "question": "从 RTL 得到目标器件上的门级结构，主要属于哪一步？",
          "options": [
            "语法缩进",
            "逻辑综合与技术映射",
            "编辑注释"
          ],
          "answer": 1,
          "explanation": "综合解释可综合描述，技术映射选用目标库中的具体逻辑单元。"
        }
      },
      {
        "id": "l1-representations",
        "title": "1.2 用不同视角描述同一个电路",
        "pages": "7–9",
        "body": [
          "布尔表达式善于写逻辑关系，原理图善于展示连接，真值表逐个列出输入输出，时序图说明信号随时间变化。第 7 页强调这些工具各有所长：查一个组合函数是否写反，真值表很直接；查寄存器究竟在哪个时钟边沿采样，则需要时序图。",
          "HDL 把这些设计意图写成文本，便于参数化、版本管理和分层。所谓与工艺无关，是说同一个逻辑描述可以面向不同实现技术重新综合，而不是任何代码都自动满足所有工艺要求。引脚、电压、时钟、器件资源和约束仍需要针对实现平台设置。",
          "第 9 页比较 Verilog 和 VHDL 的历史背景与语言风格。本课程采用 Verilog；要学习的是数字硬件的行为和结构，而不是用语言之间的流行度替代理解。后续你会用一种表示写代码，再借另一种表示检查它是否符合规格。"
        ],
        "code": "// 真值表：ab=00,01,10,11 -> y=0,0,0,1\nmodule and_view (a, b, y);\n  input a, b;\n  output y;\n  assign y = a & b;\nendmodule",
        "hardware": "真值表的四行与一个二输入与门是同一组合函数的两种表达。",
        "pitfalls": [
          "误以为时序图只用于时序电路；组合电路也有输入变化和传播过程。",
          "把可移植性理解为无需修改任何器件约束。"
        ],
        "check": {
          "question": "若要完整检查一个 2 输入组合逻辑函数，哪种资料最直接？",
          "options": [
            "列全 4 行的真值表",
            "只看模块名字",
            "只看文件创建时间"
          ],
          "answer": 0,
          "explanation": "2 个二值输入共有 2²=4 种情况，真值表可以穷尽检查。"
        }
      },
      {
        "id": "l1-workflow",
        "title": "1.3 Verilog 的用途、历史与可综合子集",
        "pages": "3–4，10–12",
        "body": [
          "第 10–11 页介绍 Verilog 的应用与标准演进，本课沿用 Verilog 2001 风格。学习目标不是记住每一项语言特性，而是掌握能稳定表达硬件、便于验证和复用的核心子集。第 3 页还给出课程评估与 FSM、CPU 项目，说明前面的基本语法最终要服务于系统设计。",
          "第 12 页区分设计输入、仿真验证与综合。仿真器按语言事件语义运行模型，综合器从其中支持的结构推导硬件。某段代码可以在仿真里执行，并不保证能综合成你想要的电路；例如测试激励中的人为延时通常不会直接变成精确延时硬件。",
          "写模块时先说清接口和功能，再列能暴露错误的输入。对于 out=data&enable，要覆盖 enable=0 与 enable=1，也要让 data 有 0 和 1；只测试全零会让许多错误实现蒙混过关。这就是后面每道可执行题配有测试向量的原因。"
        ],
        "code": "// 对此模块至少检查四组 (data, enable)\n// (0,0)->0 (1,0)->0 (0,1)->0 (1,1)->1\nassign out = data & enable;",
        "hardware": "仿真测试向量是外部施加的输入；综合得到的与门才是实现，不要把测试代码算进电路。",
        "pitfalls": [
          "只测试一组“看起来正常”的输入。",
          "把课程举出的历史芯片应用当作当前市场统计。"
        ],
        "check": {
          "question": "只有 data=0、enable=0 的测试通过，能够证明什么？",
          "options": [
            "所有情况都正确",
            "仅这组输入的结果与期望相符",
            "电路已经完成物理实现"
          ],
          "answer": 1,
          "explanation": "有限测试只对已检查的行为提供证据；本例应补齐其余三个输入组合。"
        }
      },
      {
        "id": "l1-structural",
        "title": "1.4 结构描述：把门与门连接起来",
        "pages": "13–15",
        "body": [
          "结构描述直接列出电路元件及其连接。第 14 页的 and、or、not 是语言自带门原语；门原语的位置约定是先写输出，再写输入。and(y,a,b) 表示 a、b 进入与门，其输出接到 y，不能按照日常“输入先写”的习惯调换。",
          "第 15 页把三个基本门放进 module 与 endmodule 之间。模块是电路的封装：端口是对外连接点，内部 wire 是子元件之间的连线。实例名可帮助你在波形和层级里辨认元件；and、or 等保留字则不能当普通信号名。",
          "这些门同时存在，不会等上一个门“执行完”再创建下一个门。语句的文字顺序不决定电路拓扑，信号连接才决定。沿图检查代码时，从输入出发，标记每个中间节点，再追踪到输出；这是排查漏接、接反和多驱动的基本方法。"
        ],
        "code": "module gate_mux (a, b, s, y);\n  input a, b, s;\n  output y;\n  wire ns, left, right;\n  not u0 (ns, s);\n  and u1 (left, a, ns);\n  and u2 (right, b, s);\n  or u3 (y, left, right);\nendmodule",
        "hardware": "反相器生成 ~s，两个与门分别放行 a 与 b，或门合并两路，构成 2 选 1 多路选择器。",
        "pitfalls": [
          "把原语的第一个参数误写成输入。",
          "认为门实例文字顺序规定信号的执行顺序。"
        ],
        "check": {
          "question": "and (y, a, b); 中哪个是输出？",
          "options": [
            "a",
            "b",
            "y"
          ],
          "answer": 2,
          "explanation": "Verilog 门原语把输出放在端口列表首位。"
        }
      },
      {
        "id": "l1-assign",
        "title": "1.5 连续赋值：表达式就是组合逻辑",
        "pages": "16–18",
        "body": [
          "行为描述允许直接写希望电路满足的关系，不必逐个实例化门。第 17 页 assign f=(x1&x2)|(~x2&x3) 正好描述“x2=1 取 x1，x2=0 取 x3”。先代入控制信号化简，再看表达式，会比盲目背符号更容易发现选择方向写反。",
          "连续赋值一直有效。当右侧参与信号发生变化时，左侧网络重新计算。assign 不是初始化，也不是一次性的变量赋值。对于无延时组合模型，可以理解为输入稳定后输出满足该关系；真实门会有传播延时，需在后续时序分析中另行考虑。",
          "第 18 页有多个连续表达式，中间信号 h、g 和输出 f 由连线关联。把 assign f=h|g 写在 h、g 的表达式之前，也不会改变稳定结果；每条 assign 都描述一段同时存在的逻辑。本网页运行题使用这类单模块组合表达式，便于展示反例和输入输出关系。"
        ],
        "code": "module expr_mux (x1, x2, x3, f);\n  input x1, x2, x3;\n  output f;\n  assign f = (x1 & x2) | (~x2 & x3);\nendmodule",
        "hardware": "一个反相器、两组与逻辑和一组或逻辑可实现该关系；综合器也可能识别为库中的 MUX 单元。",
        "pitfalls": [
          "忘记 ~x2，把两条数据通路同时用 x2 控制。",
          "把 assign 理解为仅在仿真开始时执行一次。"
        ],
        "check": {
          "question": "在上述公式里 x2=0 时，f 等于什么？",
          "options": [
            "x1",
            "x3",
            "恒为 0"
          ],
          "answer": 1,
          "explanation": "代入后 (x1&0)|(~0&x3)=x3。"
        }
      },
      {
        "id": "l1-procedural",
        "title": "1.6 always 与敏感列表：块内有顺序，块间可并行",
        "pages": "19–20",
        "body": [
          "第 19 页给出相同选择器的 always 写法：敏感列表包括 x1、x2、x3，任何一个改变都会重新执行 if-else。块内部按语言顺序评估语句；这是一种描述逻辑行为的方法，不代表电路里装着一个运行 if 的通用处理器。",
          "第 20 页强调并发语句与过程语句的差别。门实例与 assign 彼此并发；一个 always 内部的语句有过程顺序；不同 always 块则仍是并发过程。必须同时考虑“过程内部的顺序”和“过程之间的并发”，不能只套用 C 程序的一条执行线。",
          "过程赋值的目标在传统 Verilog 中声明为 reg，但 reg 不自动等于硬件寄存器。完整敏感列表、完整分支覆盖且不依赖历史值的 always 可以得到组合逻辑。若某路径没给输出赋值，旧值可能被保留并推导锁存器；这个关键区别会在第 5–6 课具体练习。"
        ],
        "code": "module procedural_mux (a, b, s, y);\n  input a, b, s;\n  output reg y;\n  always @(*) begin\n    if (s) y = b;\n    else y = a;\n  end\nendmodule",
        "hardware": "所有分支都赋值，因此仍是多路选择器；always 和 reg 这两个词本身不会增加存储元件。",
        "pitfalls": [
          "看到 reg 就判断一定存在触发器。",
          "只写 always @(s)，漏掉 a、b，造成仿真更新不完整。"
        ],
        "check": {
          "question": "一个完整赋值的 always @(*) 多路选择器必然有寄存器吗？",
          "options": [
            "必然有",
            "不必然，可能是纯组合逻辑",
            "只要缩进就有"
          ],
          "answer": 1,
          "explanation": "硬件由触发方式、分支覆盖和数据依赖决定，不由 reg 名称单独决定。"
        }
      },
      {
        "id": "l1-map",
        "title": "1.7 从代码反推电路与建立调试证据链",
        "pages": "21（整课回顾）",
        "body": [
          "先找边界：输入输出是什么、位宽多大、有没有时钟。再找表达式：&、|、~ 通常对应按位门，?: 对应选择，+ 对应算术网络。最后找状态：是否在时钟边沿保存数据，或者因分支缺失需要记住旧值。这样读代码能把文本还原为硬件问题。",
          "本课同一个选择功能出现了门级、assign 与 always 三种表示。用两条规格就能交叉验证：s=0 时 y=a，s=1 时 y=b。检查表达式、门图与过程分支是否都满足这两条，比只核对某一种代码格式更可靠。",
          "调试要给出“哪组输入、期望是什么、实际是什么、由哪项关系导致”的完整证据。例如若错误代码 y=(a&s)|(b&s)，输入 a=1,b=0,s=0 就能立刻暴露问题：期望 1，实际 0；两条支路都被 s=0 关断。"
        ],
        "code": "// 错误：两条支路都受 s 控制\nassign y = (a & s) | (b & s);\n// 修正：两条支路使用互补的选择条件\nassign y = (a & ~s) | (b & s);",
        "hardware": "正确结构的两条支路互补选通；错误结构在 s=0 时把所有数据都屏蔽了。",
        "pitfalls": [
          "只说“运行错了”，没有写出可重现输入。",
          "以变量名好看与否判断功能正确性。"
        ],
        "check": {
          "question": "对错误公式 (a&s)|(b&s)，哪组输入能暴露 s=0 通路丢失？",
          "options": [
            "a=0,b=0,s=0",
            "a=1,b=0,s=0",
            "a=0,b=1,s=1"
          ],
          "answer": 1,
          "explanation": "s=0 应选 a=1，但错误公式变成 0。"
        }
      }
    ],
    "exercises": [
      {
        "id": "l1-e1",
        "title": "识别综合与验证",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l1-journey",
        "prompt": "规格已经写成 RTL，现在要把它变成目标 FPGA 上的逻辑网络，应该做什么？",
        "options": [
          "综合与技术映射",
          "只加注释",
          "改变文件名"
        ],
        "answer": 0,
        "explanation": "RTL 需经综合与技术映射才能形成目标资源上的逻辑网络；仿真则检查行为。",
        "hints": [
          "回到第 6 页流程图。"
        ]
      },
      {
        "id": "l1-e2",
        "title": "模块的结束边界",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l1-structural",
        "prompt": "填入结束模块定义的 Verilog 关键字。",
        "starter": "module block1 (a, y);\n  input a;\n  output y;\n  assign y = a;\n___",
        "solution": "endmodule",
        "accepted": [
          "endmodule"
        ],
        "explanation": "module 与 endmodule 定义电路封装边界；end 只结束 begin 块。",
        "hints": [
          "与 module 配对。"
        ]
      },
      {
        "id": "l1-e3",
        "title": "并发语句的重排",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l1-assign",
        "prompt": "交换两个无环 assign 语句的文字顺序，连接关系完全相同，稳定输出通常怎样？",
        "options": [
          "随文字顺序改变",
          "保持同一逻辑函数",
          "只能得到全零"
        ],
        "answer": 1,
        "explanation": "连续赋值并发存在，信号依赖和连接决定逻辑关系。",
        "hints": [
          "把每条 assign 画成一段组合逻辑。"
        ]
      },
      {
        "id": "l1-e4",
        "title": "写出二输入与门",
        "type": "code",
        "difficulty": 1,
        "sectionId": "l1-representations",
        "prompt": "用连续赋值实现 y=a AND b，检查全部四个输入组合。",
        "starter": "module exercise (a, b, y);\n  input a;\n  input b;\n  output y;\n  assign y = 1'b0;\nendmodule",
        "solution": "module exercise (a, b, y);\n  input a;\n  input b;\n  output y;\n  assign y = a & b;\nendmodule",
        "explanation": "与门只在两个输入都为 1 时输出 1；& 将两个一位输入对应连接。",
        "hints": [
          "先列出 00、01、10、11。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 1
          },
          {
            "name": "b",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1
            },
            "expected": {
              "y": 1
            }
          }
        ]
      },
      {
        "id": "l1-e5",
        "title": "实现有使能的数据通路",
        "type": "code",
        "difficulty": 2,
        "sectionId": "l1-workflow",
        "prompt": "en=0 时 y=0，en=1 时 y=d。用一个组合表达式实现。",
        "starter": "module exercise (d, en, y);\n  input d;\n  input en;\n  output y;\n  assign y = d;\nendmodule",
        "solution": "module exercise (d, en, y);\n  input d;\n  input en;\n  output y;\n  assign y = d & en;\nendmodule",
        "explanation": "使能为 0 必须屏蔽数据；表达式 d&en 同时覆盖使能与数据四种组合。",
        "hints": [
          "当 en=0 时，什么逻辑运算必然产生 0？"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "d",
            "width": 1
          },
          {
            "name": "en",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "d": 0,
              "en": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "d": 0,
              "en": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "d": 1,
              "en": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "d": 1,
              "en": 1
            },
            "expected": {
              "y": 1
            }
          }
        ]
      },
      {
        "id": "l1-e6",
        "title": "修复选反的 MUX",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l1-assign",
        "prompt": "规格：s=0 取 a，s=1 取 b。当前代码选反了，修改 assign。",
        "starter": "module exercise (a, b, s, y);\n  input a;\n  input b;\n  input s;\n  output y;\n  assign y = s ? a : b;\nendmodule",
        "solution": "module exercise (a, b, s, y);\n  input a;\n  input b;\n  input s;\n  output y;\n  assign y = s ? b : a;\nendmodule",
        "explanation": "?: 中问号后是条件为真时的值，冒号后是条件为假时的值；用 a≠b 的向量才能辨认选择方向。",
        "hints": [
          "选 a=0,b=1 分别检查 s=0 和 1。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 1
          },
          {
            "name": "b",
            "width": 1
          },
          {
            "name": "s",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          }
        ]
      },
      {
        "id": "l1-e7",
        "title": "reg 与硬件寄存器",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l1-procedural",
        "prompt": "always @(*) 的完整 if-else 在每条路径给 y 赋值，输出声明为 reg。这通常构造什么？",
        "options": [
          "纯组合选择逻辑",
          "必然是 D 触发器",
          "必然是 RAM"
        ],
        "answer": 0,
        "explanation": "reg 表示可被过程赋值的变量；本例不需要保存历史，因而没有状态。",
        "hints": [
          "寻找边沿触发和保留旧值的路径。"
        ]
      },
      {
        "id": "l1-e8",
        "title": "把门图转换为表达式",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l1-map",
        "prompt": "输出 y 是两个支路的或：左支路 a AND NOT s，右支路 b AND s。直接写组合表达式。",
        "starter": "module exercise (a, b, s, y);\n  input a;\n  input b;\n  input s;\n  output y;\n  assign y = (a & s) | (b & s);\nendmodule",
        "solution": "module exercise (a, b, s, y);\n  input a;\n  input b;\n  input s;\n  output y;\n  assign y = (a & ~s) | (b & s);\nendmodule",
        "explanation": "两个互补选择条件保证二值 s 下恰好选择一条数据通路。输入 a=1,b=0,s=0 是原错误的明确反例。",
        "hints": [
          "先把 s=0 代入。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 1
          },
          {
            "name": "b",
            "width": 1
          },
          {
            "name": "s",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "title": "Verilog 的词法、四态与数据类型",
    "subtitle": "命名、位宽、wire/reg、存储器数组与参数",
    "sourceFile": "Lecture02.pdf",
    "sourcePages": 23,
    "available": true,
    "summary": "把信号的名称、驱动方式、位宽和取值域说清楚。重点区分 0/1/X/Z、向量与数组、语言变量与真实寄存器，避免之后所有设计都被宽度和类型错误拖累。",
    "objectives": [
      "识别合法标识符并用 begin/end 控制块范围",
      "解释四态逻辑与多驱动冲突",
      "读写带尺寸常量并检查扩展和截断",
      "区分 wire、tri、reg、integer、memory 与 parameter"
    ],
    "sections": [
      {
        "id": "l2-lexical",
        "title": "2.1 语句边界、大小写与缩进陷阱",
        "pages": "2，4–6",
        "body": [
          "空格、制表符和空行主要服务可读性，语句或声明通常以分号结束。// 到行末是单行注释，/*...*/ 是跨行注释。Verilog 区分大小写，Count 与 count 是不同标识符；若拼错而工具允许隐式网络，错误甚至可能变成一条意外的一位线。",
          "第 5 页强调缩进不决定控制范围。for 后没有 begin/end 时只控制一个语句；完整 if-else 是一个语句，因此它可以整体受 for 控制。想在循环体或分支中放多条语句，就必须用 begin/end，不能靠视觉缩进表示从属关系。",
          "普通标识符以字母或下划线开头，后续可含数字、下划线和美元符号。数字不能作为首字符，保留字不能当普通名称。课件第 2、5 页的 VHDL 字样是笔误；这里的示例、关键字与本课程练习都属于 Verilog，不要由此混用两种语言语法。"
        ],
        "code": "// Q[n-1] 的赋值不属于循环体\nfor (k = 0; k < n-1; k = k+1)\n  Q[k] <= Q[k+1];\nQ[n-1] <= w;\n\n// 两条语句都属于循环体\nfor (k = 0; k < n-1; k = k+1) begin\n  Q[k] = 0;\n  R[k] = 1;\nend",
        "hardware": "begin/end 规定过程控制的语句集合；缩进本身不会新增任何硬件。",
        "pitfalls": [
          "把 Verilog 的 begin/end 换成 C 的花括号块。",
          "以 2input、wire 或 module 作为普通信号名。"
        ],
        "check": {
          "question": "以下哪个是合法普通标识符？",
          "options": [
            "2data",
            "data_2",
            "module"
          ],
          "answer": 1,
          "explanation": "data_2 以字母开始且后续字符合法；module 是保留字。"
        }
      },
      {
        "id": "l2-fourstate",
        "title": "2.2 0、1、X、Z 分别代表什么",
        "pages": "3，7–10",
        "body": [
          "0 和 1 表示确定的逻辑低与高。X 表示模型无法确定当前值，可能来自尚未初始化的变量、相互冲突的驱动，或未知输入传播。Z 表示高阻，即这个驱动器没有向节点施加 0 或 1；它不是第三种可当数据读取的正常电压逻辑。",
          "第 9 页用断开的开关说明 Z 的直觉：没有驱动器接入时，节点悬空。一个反相器看到 Z 输入通常无法知道输出应为 0 还是 1，因此仿真得到 X。第 10 页的四态门表还说明未知值未必总让整个结果未知，例如 0&X=0、1|X=1，因为确定的控制值已经决定输出。",
          "四态是仿真建模能力，不是说芯片有一个稳定的“X 电平”。真实电路中的浮空、冲突、上电状态和亚稳态需要从电气与时序角度处理。网页的可执行组合判题只针对二值端口，四态题在此用真值推演来学习，不将其伪装成完整四态仿真。"
        ],
        "code": "// 四态推演（此处是讲解示例）\n// 1'b0 & 1'bx -> 0\n// 1'b1 | 1'bx -> 1\n// ~1'bz       -> x\n// 1'b1 ^ 1'bx -> x",
        "hardware": "X 是诊断信息，Z 是驱动状态；普通逻辑门通常将高阻输入视作不能确定的逻辑值。",
        "pitfalls": [
          "把 X 当作“随机生成一个 0 或 1”。",
          "把 Z 当作逻辑 0，忽略节点浮空。"
        ],
        "check": {
          "question": "0 & X 的四态逻辑结果是什么？",
          "options": [
            "0",
            "1",
            "X"
          ],
          "answer": 0,
          "explanation": "与门中 0 是控制值，另一输入为何都不能令输出为 1。"
        }
      },
      {
        "id": "l2-tristate",
        "title": "2.3 三态总线与多个驱动的解析",
        "pages": "10–11",
        "body": [
          "第 10–11 页把普通逻辑门和带使能三态缓冲器放在一起。使能有效时驱动器把输入送上总线；使能无效时输出 Z。三态的意义是允许多个器件共享一条物理连线，但任意时刻必须协调谁负责驱动。",
          "可以先推内部信号 T，再解析 OUT：T=Z 且另一个驱动 B=1 时 OUT=1；T=Z、B=Z 时 OUT=Z；T=1、B=0 时冲突而出现 X。第 11 页表格展示的正是“驱动器自身行为”和“多个驱动合成后的节点值”两个层次。",
          "wire 是通用互连网络，tri 明确表达多驱动三态节点意图。是否能在目标 FPGA 内部实现三态，要看器件与综合规则；很多内部逻辑会被改写为多路选择结构，真正的高阻通常出现在 I/O 引脚。理解接口约定比只记住 tri 关键字更重要。"
        ],
        "code": "tri bus;\nassign bus = en_a ? a : 1'bz;\nassign bus = en_b ? b : 1'bz;\n// 应由协议保证 en_a 与 en_b 不同时驱动冲突值",
        "hardware": "两路可断开的输出驱动共同连到同一节点；仲裁逻辑负责避免同时驱动相反电平。",
        "pitfalls": [
          "让两个普通驱动同时把共享总线拉成相反值。",
          "认为所有 Z 合成以后必然等于 0。"
        ],
        "check": {
          "question": "同一总线上一个驱动为 Z，另一个驱动为 1，解析后的值通常是什么？",
          "options": [
            "Z",
            "1",
            "0"
          ],
          "answer": 1,
          "explanation": "Z 表示该驱动未参与，确定的 1 驱动决定节点值。"
        }
      },
      {
        "id": "l2-numbers",
        "title": "2.4 常量的尺寸、进制与扩展",
        "pages": "12–14",
        "body": [
          "带尺寸常量写作 size'radix value：8'hA 的 8 指八位，不是八个十六进制数字，h 表示十六进制，A 等于十进制 10，因此得到二进制 00001010。相同数值可以有不同位宽，硬件连接时必须同时关注数值与尺寸。",
          "下划线仅用于分组可读性，8'b0101_1101 与 8'b01011101 完全相同。对课件中的无符号带尺寸常量，尺寸比数字长且最高位是 0/1 时补零；若左端写 X/Z，通常按 X/Z 扩展。注意这条规则针对这里的常量表示，不要推广成“所有 signed 信号赋值也一律补零”。",
          "无尺寸十进制常量如 10 通常至少 32 位，参与表达式时可能影响宽度与符号。声明 4 位输出再接一个更宽的结果，会保留低位并丢弃高位；这不是编译器替你保留进位。初学时显式写尺寸，算术时显式扩宽，能避免很多悄悄发生的截断。"
        ],
        "code": "// 数值相同，表示尺寸不同\n// 4'd3    -> 0011\n// 8'hA    -> 00001010\n// 5'b111  -> 00111\n// 8'bx1101 -> xxxx1101\n// 4'b1111 + 4'b0001 的完整数学结果需要 5 位",
        "hardware": "位宽决定连线数量；截断相当于没有连接高位，扩展相当于为新增位补入明确的电平或符号。",
        "pitfalls": [
          "把 8'hA 读成八个十六进制位。",
          "忽视无尺寸常量对表达式宽度的影响。"
        ],
        "check": {
          "question": "8'hA 的二进制位串是什么？",
          "options": [
            "1010",
            "00001010",
            "10101010"
          ],
          "answer": 1,
          "explanation": "8 指八位，数值 A=10，因此左侧补四个 0。"
        }
      },
      {
        "id": "l2-nets",
        "title": "2.5 wire 与 tri：连接与驱动关系",
        "pages": "15–17",
        "body": [
          "网络类型代表电路节点及其连接。wire 没有“记住上次赋值”的语言变量语义，它的值来自持续连接的驱动器，例如门输出、模块输出或 assign。第 16 页强调连续赋值左侧使用网络，这与后面的过程变量写法需要区分。",
          "wire [7:0] data 是八条按位组织的连线，data[7] 是其中一位；[7:0] 两端都计入，因此宽度为 7−0+1=8。区间不要求从 0 开始，例如 [15:12] 也是四位，只是这些位的名称索引是 15、14、13、12。",
          "传统 Verilog 的 input/output/inout 在没有额外类型说明时通常为网络端口。output reg y 则允许在过程块中给输出赋值。为了便于审查，建议明确写出方向、范围和驱动方式，避免隐式网络掩盖拼写错误；后续模块连接练习会继续检验位宽。"
        ],
        "code": "wire ready;\nwire [7:0] data;\ntri [7:0] shared_bus;\nassign ready = enable & valid;\nassign data = source;",
        "hardware": "标量 ready 是一条线；data 与 shared_bus 各为八条线，tri 特别表达可能含高阻共享驱动的意图。",
        "pitfalls": [
          "认为 [7:0] 有七位。",
          "试图在 always 中对普通 wire 作过程赋值。"
        ],
        "check": {
          "question": "wire [15:12] addr; 一共有几位？",
          "options": [
            "3",
            "4",
            "16"
          ],
          "answer": 1,
          "explanation": "范围两端都包括，15−12+1=4。"
        }
      },
      {
        "id": "l2-variables",
        "title": "2.6 reg、integer 与真实存储元件",
        "pages": "18–20",
        "body": [
          "第 18–20 页把 register 类型解释为能在过程赋值之间保持其语言值的变量。reg [2:0] Count 是三位默认无符号变量；integer k 是有符号 32 位整数，常见于循环索引或测试代码。它们表达仿真变量类型，不能仅由名称推断最终硬件。",
          "例如 always @(*) 中每条路径都给 y 赋值，不需要历史数据，综合可得到组合门。always @(posedge clk) 中 Q<=D 只在时钟边沿更新，通常对应触发器。如果电平敏感过程某路径不赋值，则可能需要锁存器。决定硬件的因素是完整行为，而不是 reg 是否出现。",
          "integer 的位宽与有符号属性会影响比较、移位和算术。不要为了方便把所有数据通路都声明成 integer，那会隐含引入 32 位意图，也可能把无符号比较变为有符号解释。面向接口与资源的信号应明确给出所需位数。"
        ],
        "code": "reg [2:0] Count;\ninteger k;\n// integer k 与 reg signed [31:0] k 在此类型说明上相近\n\nalways @(*) begin\n  if (s) y = a;\n  else y = b;\nend",
        "hardware": "Count 的声明本身不足以判断电路；只有看到驱动 Count 的过程、时钟和分支才能判断是门、锁存器还是触发器。",
        "pitfalls": [
          "见到 reg 就在电路图上直接画 D 触发器。",
          "把 integer 的默认有符号性质忽略掉。"
        ],
        "check": {
          "question": "integer k 的基本类型属性是什么？",
          "options": [
            "一位无符号",
            "32 位有符号",
            "任意长度字符串"
          ],
          "answer": 1,
          "explanation": "本课传统 Verilog 中 integer 为有符号 32 位变量。"
        }
      },
      {
        "id": "l2-memory",
        "title": "2.7 向量与存储器数组：先字再位",
        "pages": "21",
        "body": [
          "reg [7:0] R [3:0] 声明四个元素，每个元素八位。紧跟 reg 的 [7:0] 是每个字的位范围；名称 R 后的 [3:0] 是数组地址范围。总计 4×8=32 位数据意图，不能误读成一个 8×3 位或四位变量。",
          "R[3] 选择地址 3 的整个八位字，R[3][7] 再选择该字的第 7 位。数组地址可以升序也可以降序，合法索引由声明决定。读代码时把“第几个字”和“字中的哪一位”分开标记，能减少后续寄存器堆和 CPU 数据存储的索引错误。",
          "数组声明并不能保证综合成某一种物理 RAM。读写端口数、同步还是异步访问、复位方式和目标器件都会影响实现，可能落到寄存器阵列或存储器资源。此课首先练会正确表示维度，具体硬件需要结合访问过程再分析。"
        ],
        "code": "reg [7:0] R [3:0];\n// R[0]、R[1]、R[2]、R[3] 均为 8 位\n// R[3][7] 是地址 3 中的第 7 位\n// R[3] = 8'hA5;  应在允许过程赋值的位置使用",
        "hardware": "四行八列的存储组织：地址选择一行，位索引选择该行的一列。",
        "pitfalls": [
          "把 R[3] 误当第三位而不是一个八位字。",
          "认为声明数组就自动获得任意数量的读写端口。"
        ],
        "check": {
          "question": "reg [7:0] R [3:0]; 中 R[2] 的位宽是多少？",
          "options": [
            "1",
            "4",
            "8"
          ],
          "answer": 2,
          "explanation": "数组每个元素均由前面的 [7:0] 规定为八位。"
        }
      },
      {
        "id": "l2-parameter",
        "title": "2.8 parameter：让同一电路有不同尺寸",
        "pages": "22–23",
        "body": [
          "parameter 把常量与名称绑定，例如 parameter n=32，使接口与内部表达式共享同一个设计尺寸。input [n-1:0] X 就能在参数变化时同步调整位宽，避免复制多个只差数据宽度的模块。参数在设计展开时确定，不是运行中的输入信号。",
          "第 22 页的 n 位加法器计算 X+Y+carryin，但输出 S 只有 n 位，因此溢出的进位不会出现在 S 中。如果规格需要完整结果，应额外提供进位或将结果扩到 n+1 位；参数化并不会自动解决位宽设计问题。",
          "参数的价值是把接口约束集中起来：哪些宽度随 n 改变，哪些输出要覆盖 0..n 等范围，都必须一起思考。下一课的运算符和第 4 课的实例参数覆盖会把这种思维继续扩展到加法器与位计数器。"
        ],
        "code": "module add4 (X, Y, carryin, S);\n  input [3:0] X, Y;\n  input carryin;\n  output [4:0] S;\n  assign S = {1'b0, X} + {1'b0, Y} + carryin;\nendmodule\n// 讲解：这里用固定 n=4，把完整结果扩为 n+1=5 位",
        "hardware": "参数决定展开时的数据通路条数；加法器是否保留进位取决于运算扩展和输出接口。",
        "pitfalls": [
          "尝试让 parameter 像输入一样每个时钟变化。",
          "n 位加法结果只保留 n 位却仍宣称保留了所有进位。"
        ],
        "check": {
          "question": "两个四位无符号数加 carryin，完整结果最多需要多少位？",
          "options": [
            "4 位",
            "5 位",
            "8 位"
          ],
          "answer": 1,
          "explanation": "最大值 15+15+1=31，需要五位二进制表示。"
        }
      }
    ],
    "exercises": [
      {
        "id": "l2-e1",
        "title": "控制范围靠什么",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l2-lexical",
        "prompt": "for 后连续写两条语句，但只有第一条属于循环体。要让两条都属于循环体，应怎样修改？",
        "options": [
          "只增加缩进",
          "使用 begin/end 包围两条语句",
          "换成大写 FOR"
        ],
        "answer": 1,
        "explanation": "Verilog 使用语句与 begin/end 确定范围，缩进不改变语义。",
        "hints": [
          "阅读第 5 页示例。"
        ]
      },
      {
        "id": "l2-e2",
        "title": "总线冲突的诊断",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l2-tristate",
        "prompt": "两个驱动器同时将同一 wire 分别驱动为 0 和 1，仿真中常见什么结果？",
        "options": [
          "0",
          "1",
          "X"
        ],
        "answer": 2,
        "explanation": "等强度相反驱动产生冲突，X 提醒你检查使能仲裁和连接。",
        "hints": [
          "X 的来源不只有未初始化。"
        ]
      },
      {
        "id": "l2-e3",
        "title": "写出十六进制常量",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l2-numbers",
        "prompt": "写一个 8 位十六进制常量，数值为十进制 10。只填常量。",
        "starter": "assign y = ___;",
        "solution": "8'hA",
        "accepted": [
          "8'hA",
          "8'ha",
          "8'h0A",
          "8'h0a"
        ],
        "explanation": "尺寸 8 指八位，h 代表十六进制，A=10；结果是 00001010。",
        "hints": [
          "结构是 size'base digits。"
        ]
      },
      {
        "id": "l2-e4",
        "title": "读懂存储器声明",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l2-memory",
        "prompt": "reg [7:0] R [3:0]; 声明了几个八位元素？填写十进制数字。",
        "starter": "// 元素数量：___",
        "solution": "4",
        "accepted": [
          "4"
        ],
        "explanation": "地址范围为 3、2、1、0，共四个元素，总数据量为 32 位。",
        "hints": [
          "范围两端都包括。"
        ]
      },
      {
        "id": "l2-e5",
        "title": "reg 的真实含义",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l2-variables",
        "prompt": "哪一种描述最准确？",
        "options": [
          "reg 关键字保证综合成触发器",
          "reg 是过程变量，硬件由完整驱动行为决定",
          "reg 只能写在 initial 中"
        ],
        "answer": 1,
        "explanation": "组合 always 也可赋值 reg；边沿与历史依赖才是判断存储的关键。",
        "hints": [
          "对照第 20 页的特别提醒。"
        ]
      },
      {
        "id": "l2-e6",
        "title": "位宽截断观察",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l2-nets",
        "prompt": "将 8 位 x 的低 4 位连接到 4 位 y；不要取高四位。",
        "starter": "module exercise (x, y);\n  input [7:0] x;\n  output [3:0] y;\n  assign y = x[7:4];\nendmodule",
        "solution": "module exercise (x, y);\n  input [7:0] x;\n  output [3:0] y;\n  assign y = x[3:0];\nendmodule",
        "explanation": "x[3:0] 选择低四位。0xA5 应输出 0x5，可暴露错误的高半字节选择。",
        "hints": [
          "先把 0xA5 写成 1010_0101。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "x",
            "width": 8
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 4
          }
        ],
        "vectors": [
          {
            "inputs": {
              "x": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 15
            },
            "expected": {
              "y": 15
            }
          },
          {
            "inputs": {
              "x": 16
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 165
            },
            "expected": {
              "y": 5
            }
          },
          {
            "inputs": {
              "x": 240
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 255
            },
            "expected": {
              "y": 15
            }
          }
        ]
      },
      {
        "id": "l2-e7",
        "title": "保留完整加法结果",
        "type": "code",
        "difficulty": 2,
        "sectionId": "l2-parameter",
        "prompt": "a、b 各四位，输出 sum 五位。显式补零后相加，使 15+15 得到 30。",
        "starter": "module exercise (a, b, sum);\n  input [3:0] a;\n  input [3:0] b;\n  output [4:0] sum;\n  assign sum = 5'b00000;\nendmodule",
        "solution": "module exercise (a, b, sum);\n  input [3:0] a;\n  input [3:0] b;\n  output [4:0] sum;\n  assign sum = {1'b0, a} + {1'b0, b};\nendmodule",
        "explanation": "补零将操作数解释为五位无符号数，五位输出保留 0..30 的完整结果。",
        "hints": [
          "把每个输入变成五位向量后再加。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 4
          },
          {
            "name": "b",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "sum",
            "width": 5
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0
            },
            "expected": {
              "sum": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 2
            },
            "expected": {
              "sum": 3
            }
          },
          {
            "inputs": {
              "a": 15,
              "b": 1
            },
            "expected": {
              "sum": 16
            }
          },
          {
            "inputs": {
              "a": 8,
              "b": 8
            },
            "expected": {
              "sum": 16
            }
          },
          {
            "inputs": {
              "a": 15,
              "b": 15
            },
            "expected": {
              "sum": 30
            }
          },
          {
            "inputs": {
              "a": 7,
              "b": 9
            },
            "expected": {
              "sum": 16
            }
          }
        ]
      },
      {
        "id": "l2-e8",
        "title": "常量与按位取反",
        "type": "code",
        "difficulty": 2,
        "sectionId": "l2-numbers",
        "prompt": "输出 y 为八位输入 x 每一位取反后的结果，输出 mask 恒为 8'hA5。",
        "starter": "module exercise (x, y, mask);\n  input [7:0] x;\n  output [7:0] y;\n  output [7:0] mask;\n  assign y = x;\n  assign mask = 8'h00;\nendmodule",
        "solution": "module exercise (x, y, mask);\n  input [7:0] x;\n  output [7:0] y;\n  output [7:0] mask;\n  assign y = ~x;\n  assign mask = 8'hA5;\nendmodule",
        "explanation": "~ 对每一位取反，八位输出限制在 0..255；A5 是 1010_0101。",
        "hints": [
          "每位取反与逻辑非不是同一个运算。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "x",
            "width": 8
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 8
          },
          {
            "name": "mask",
            "width": 8
          }
        ],
        "vectors": [
          {
            "inputs": {
              "x": 0
            },
            "expected": {
              "y": 255,
              "mask": 165
            }
          },
          {
            "inputs": {
              "x": 255
            },
            "expected": {
              "y": 0,
              "mask": 165
            }
          },
          {
            "inputs": {
              "x": 15
            },
            "expected": {
              "y": 240,
              "mask": 165
            }
          },
          {
            "inputs": {
              "x": 165
            },
            "expected": {
              "y": 90,
              "mask": 165
            }
          },
          {
            "inputs": {
              "x": 90
            },
            "expected": {
              "y": 165,
              "mask": 165
            }
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "title": "把运算符翻译成硬件",
    "subtitle": "算术、按位、逻辑、归约、比较、移位与拼接",
    "sourceFile": "Lecture03.pdf",
    "sourcePages": 20,
    "available": true,
    "summary": "运算符不仅决定计算结果，也决定结果位宽、未知值传播方式和可综合的电路种类。本课刻意比较长得相似的运算符，用反例定位与、逻辑与和归约与之间的混淆。",
    "objectives": [
      "比较按位、逻辑、归约三类运算的结果宽度",
      "正确推演 X/Z 参与比较的结果",
      "检查算术位宽、移位方向与符号扩展",
      "使用条件、拼接和复制表达数据通路"
    ],
    "sections": [
      {
        "id": "l3-arithmetic",
        "title": "3.1 算术运算：数值正确还要位宽正确",
        "pages": "2–6",
        "body": [
          "第 5–6 页给出 +、-、一元负号、乘除和取模。加减描述算术网络，不是一个默认共享的 CPU 运算步骤；乘法、除法或取模的硬件代价可能很大，是否支持、采用何种结构还要看目标工具与常量条件。网页可执行子集此处重点练 +、-。",
          "一元负号采用二进制补码解释。四位数据 3 的补码负值低四位为 1101；把它声明为无符号得到 13，声明为四位有符号才解释为 -3。位串本身不携带“这是正负数”的直觉，类型、位宽和运算上下文一起决定含义。",
          "取模不是数学中始终非负的模，课件用 -5%2=-1 说明结果取被除数符号。算术题还要检查进位：若要保留 a+b 的完整结果，显式补零扩宽操作数并连接更宽输出，不能只凭输出变量名字叫 total 就假设安全。"
        ],
        "code": "module add_complete (a, b, sum);\n  input [3:0] a, b;\n  output [4:0] sum;\n  assign sum = {1'b0, a} + {1'b0, b};\nendmodule",
        "hardware": "两组五位输入进入加法网络，其中最高位接 0；五位输出保留四位无符号输入相加的进位。",
        "pitfalls": [
          "把取模对负数的结果误写成一定非负。",
          "忽略表达式大小、符号规则与目的位宽。"
        ],
        "check": {
          "question": "两个四位无符号数 15 与 1 相加，若只保留低四位，结果是多少？",
          "options": [
            "16",
            "0",
            "1"
          ],
          "answer": 1,
          "explanation": "完整结果为 10000，低四位是 0000；进位需要额外位保存。"
        }
      },
      {
        "id": "l3-bitwise",
        "title": "3.2 按位运算与四态控制值",
        "pages": "7–8",
        "body": [
          "~、&、|、^ 等按位运算让向量中的对应位独立处理。A=1010、B=1100 时，A&B=1000、A|B=1110、A^B=0110。输出仍是一个向量，适合掩码、逐位比较、数据屏蔽和位翻转。",
          "课件第 8 页列出 X/Z 的门级真值：0&X=0、1|Z=1，而 1&X、0|Z、X^0 都无法确定。与门的 0 和或门的 1 是控制值，它们能屏蔽另一个未知输入；异或必须知道两位才能确定输出。",
          "按位异或可以发现差异位，~(A^B) 则在相同位输出 1。先做逐位比较再统计 1 的数量，就会得到第 4 课的“相同位数”模块。这个联系说明：一个运算符的结果可以作为下一层模块的输入，构成可解释的硬件数据流。"
        ],
        "code": "// A=4'b1010, B=4'b1100\nassign both = A & B;      // 1000\nassign either = A | B;    // 1110\nassign different = A ^ B; // 0110\nassign same = ~(A ^ B);   // 1001",
        "hardware": "四位按位运算可看作四个并排的一位门，每一列处理一对对应输入。",
        "pitfalls": [
          "用 & 掩码时忘记掩码的位宽。",
          "把按位异或误解为“整个向量只输出一个真假”。"
        ],
        "check": {
          "question": "4'b1010 ^ 4'b1100 的结果是什么？",
          "options": [
            "0110",
            "1110",
            "1000"
          ],
          "answer": 0,
          "explanation": "两位不同输出 1，相同输出 0，逐位得到 0110。"
        }
      },
      {
        "id": "l3-logical",
        "title": "3.3 逻辑运算：先判断整体真假，再得一位",
        "pages": "9",
        "body": [
          "逻辑非 !、逻辑与 && 和逻辑或 || 针对操作数整体是否为真，结果为一位。对于二值向量，只要任意位为 1，整个向量就是非零、即真。因此 4'b0010 && 4'b0100 得到 1，尽管两者没有任何重叠的 1 位。",
          "相同输入做按位 & 则得到 0000。这是非常常见的代码错误：想检测两个条件都成立，应考虑逻辑与；想对数据总线逐位筛选，应使用按位与。不要靠输出位宽截断来掩盖运算类别写错，因为恰好通过某组输入不说明语义相同。",
          "四态参与整体真假的推演也要谨慎：若一个向量已含确定的 1，整体可判断为真；若没有确定 1 却含 X/Z，则真假可能未知。这里可执行题采用二值输入，把四态边界留在概念练习中，避免浏览器有限子集给出过度承诺。"
        ],
        "code": "// 二值对比：A=4'b0010, B=4'b0100\n// A & B  -> 4'b0000\n// A && B -> 1'b1\n// !A     -> 1'b0\n// ~A     -> 4'b1101",
        "hardware": "按位 & 是四组门；整体真假判断需要先归并各向量，再形成一个逻辑结果。",
        "pitfalls": [
          "用 && 做四位掩码，结果只剩一位真假。",
          "把 ! 与 ~ 视为可以互换。"
        ],
        "check": {
          "question": "A=0010、B=0100 时，A&&B 是什么？",
          "options": [
            "0",
            "1",
            "四位 0000"
          ],
          "answer": 1,
          "explanation": "两个向量都非零，因此都为真，逻辑与返回一位 1。"
        }
      },
      {
        "id": "l3-reduction",
        "title": "3.4 归约：把一个向量折叠成一位",
        "pages": "10",
        "body": [
          "归约运算只有一个操作数，例如 &A 把 A 的所有位做与，|A 判断是否至少一个位为 1，^A 计算各位异或。它们的结果都是一位；区别于 A&B 这种两个向量的逐位运算。先数操作数的数量，再看结果宽度，能快速辨别。",
          "第 10 页用 0011 演示：归约与为 0，归约或为 1，归约异或为 0。归约异或等于 1 表示输入中 1 的个数为奇数，因此可用于奇偶校验。取反形式 ~&、~|、~^ 分别得到归约结果的反值。",
          "从硬件看，归约可以形成门树；文字只有一个符号，并不代表物理上只需一只二输入门。为适应本网页的受限执行子集，代码练习把四位归约异或写成 A[0]^A[1]^A[2]^A[3]，它与二值情况下的 ^A 有相同功能。"
        ],
        "code": "// 归约表达式（讲解）\nassign any_one = |A;\nassign all_one = &A;\nassign parity = ^A;\n// 四位展开后的等价奇偶关系\nassign parity4 = A[0] ^ A[1] ^ A[2] ^ A[3];",
        "hardware": "四路输入归并到一个输出，可实现为多级二输入门；parity 表示奇数个 1 的检测。",
        "pitfalls": [
          "把 ^A 的一位结果误当成 A 的逐位取反。",
          "认为归约异或输出是 1 的个数，而非奇偶性。"
        ],
        "check": {
          "question": "4'b0011 的归约异或 ^A 是什么？",
          "options": [
            "0",
            "1",
            "2"
          ],
          "answer": 0,
          "explanation": "有两个 1，1^1=0；输出反映奇偶性而不是计数。"
        }
      },
      {
        "id": "l3-compare",
        "title": "3.5 比较、相等与全等：保留四态证据",
        "pages": "11–13",
        "body": [
          "<、>、<=、>= 和相等比较都产生一位结果。这里的 <= 若出现在表达式中是“小于等于”，若位于过程赋值位置则是非阻塞赋值；上下文决定它扮演哪个角色，不能见到这个字符就自动认为是寄存器更新。",
          "==、!= 比较数据值；若未知位使结果无法确定，会返回 X。===、!== 把 X 和 Z 也作为可逐位匹配的状态，结果总是确定的 0 或 1，适合测试平台中检查未知值。例如 101X === 101X 为 1，而 101X == 101X 为 X。",
          "课件第 12 页的“有未指定位就模糊”需结合第 13 页补充：若某个确定的位已经足以证明不相等，== 仍可返回 0。例如 1100 与 1Z10 在某个已知位确定冲突，因此不是必然 X。不要把 === 当作能在真实硬件中检测“X 电平”的通用电路。"
        ],
        "code": "// 四态推演，不属于网页二值执行器\n// 4'b101x ==  4'b101x -> x\n// 4'b101x === 4'b101x -> 1\n// 4'b1100 ==  4'b1z10 -> 0（已知位存在确定失配）",
        "hardware": "二值大小比较可综合为比较器；X/Z 全等常用于验证模型，不能解释为芯片具有 X 电平检测器。",
        "pitfalls": [
          "把 == 与 = 混用。",
          "忽略已知失配，机械地把所有含 X 的比较判为 X。"
        ],
        "check": {
          "question": "101X === 101X 的结果是什么？",
          "options": [
            "X",
            "0",
            "1"
          ],
          "answer": 2,
          "explanation": "全等比较把 X 也作为可匹配状态，所有位一致所以得到 1。"
        }
      },
      {
        "id": "l3-shift",
        "title": "3.6 移位、丢位与有符号右移",
        "pages": "14–15",
        "body": [
          "<< 和 >> 是逻辑移位，移出的位丢弃，新空位补零。在四位范围内，1100>>1=0110，1100<<2=0000；后者的 1 已移出四位边界，并不会自动把输出扩到六位。",
          "<<< 是算术左移，但空位同样补零；>>> 的算术右移是否补符号位还取决于左操作数是否为 signed。课件用 integer a=-8 演示 a>>>3=-1，因为 integer 为有符号 32 位。对 unsigned 向量使用 >>>，不能凭运算符名字就假设一定补 1。",
          "固定移位常常只是重新接线，变量移位则可能需要选择网络。推演时写出输入位宽、符号属性、移位量和输出宽度，再移动位格；如果只按“乘二除二”心算，容易忽略截断、负数右移和未知移位量。"
        ],
        "code": "// 四位无符号逻辑移位\nassign left2 = X << 2;\nassign right1 = X >> 1;\n// 有符号讲解：integer a=-8; a >>> 3 得 -1\n// 先看 signed，再决定算术右移的填充位",
        "hardware": "固定右移一位相当于输出高位接 0，其余位接到输入相邻的更高位；变量移位则需要可选择通路。",
        "pitfalls": [
          "以为 << 必定增加结果宽度。",
          "忽视左操作数的 signed 属性就断言 >>> 总补符号。"
        ],
        "check": {
          "question": "四位 X=1100，四位输出 Y=X<<2，Y 是什么？",
          "options": [
            "110000",
            "0000",
            "0011"
          ],
          "answer": 1,
          "explanation": "移出四位宽度的高位被丢弃，空出的低两位补 0。"
        }
      },
      {
        "id": "l3-conditional",
        "title": "3.7 条件运算：用数据选择表达硬件",
        "pages": "16",
        "body": [
          "条件 ? 真分支 : 假分支 是一个表达式，常用来写多路选择器。第 16 页 assign out=Y?b:a 说明 Y 为 1 时选择 b，为 0 时选择 a。最安全的阅读方式是先用控制位 0、1 各代入一次，不靠字母顺序猜哪条是“默认”。",
          "嵌套条件可以组成四选一网络：高位先决定分组，低位在组内选择。S[1]?(S[0]?d:c):(S[0]?b:a) 对应 00→a、01→b、10→c、11→d。括号让两层选择关系清楚，也能避免低优先级 ?: 与其他运算混在一起造成歧义。",
          "课件还用 enable?in:16'bz 描述三态缓冲。这个分支产生 Z，因此与普通返回 0 的屏蔽器不同：前者释放共享节点，后者仍主动驱动低电平。选择器、门控屏蔽与三态接口的规格不能混为一谈。"
        ],
        "code": "assign out = S[1] ? (S[0] ? d : c)\n                  : (S[0] ? b : a);\n// 三态讲解：assign bus = enable ? data : 16'bz;",
        "hardware": "嵌套条件可对应三个二选一 MUX；使能高阻分支则描述可断开的输出驱动。",
        "pitfalls": [
          "把真、假分支反接。",
          "用常零分支代替高阻，导致总线仍被占用。"
        ],
        "check": {
          "question": "S=2'b10 时，上述四选一表达式选择哪个数据？",
          "options": [
            "a",
            "c",
            "d"
          ],
          "answer": 1,
          "explanation": "S[1]=1 进入 d/c 组，S[0]=0 选择 c。"
        }
      },
      {
        "id": "l3-concat",
        "title": "3.8 拼接与复制：用位段组装总线",
        "pages": "17–18",
        "body": [
          "{A,B} 按从左到右把 A 放在高位、B 放在低位，新位宽等于各段宽度之和。第 17 页 B=00、C=10 时 {B,C}=0010。拼接并不执行加法，两个数值并排后的意义由你定义的数据格式决定。",
          "拼接中的操作数必须有明确尺寸，避免无尺寸常量带来不确定宽度。{1'b0,A} 是常用零扩展，{A[3],A} 可以为一个四位有符号位串增加一位符号扩展；后者只是位操作，是否按有符号数运算仍要看类型上下文。",
          "{n{m}} 把位段 m 复制 n 次。第 18 页 {4{1'b1}} 得到 1111；复制可快速生成掩码、重复字段或符号扩展。读任何拼接先数总位数，再标高低顺序，最后检查目标端口是否会截断。"
        ],
        "code": "// B 为 2 位、D 为 3 位\nassign packed = {B[0], D[2], 2'b11}; // 共 4 位\n// 复制讲解：{4{1'b1}} -> 4'b1111\n// 网页练习可写成普通拼接：{a,a,a,a}",
        "hardware": "拼接与复制通常首先体现为线的排列和扇出；不会因为出现花括号就必然增加计算单元。",
        "pitfalls": [
          "将 {A,B} 的高低位顺序写反。",
          "认为复制 n 次相当于把数值乘以 n。"
        ],
        "check": {
          "question": "A 是 1 位，B 是 2 位，{A,B,B} 有几位？",
          "options": [
            "3",
            "4",
            "5"
          ],
          "answer": 2,
          "explanation": "总宽度为 1+2+2=5。"
        }
      },
      {
        "id": "l3-precedence",
        "title": "3.9 优先级与按步骤定位运算错误",
        "pages": "19–20",
        "body": [
          "第 19 页提供优先级表，从一元和算术、移位、关系与相等，直到位运算、逻辑与条件运算。实际工程中不应把正确性寄托在背诵整张表：表达式跨类别时用括号写出意图，让读者和工具看到同一结构。",
          "例如要检测 (A&B) 是否非零，应明确写 (A&B)!=0；如果写 A&B!=0，比较和位与的结合顺序可能违背你的意图。这里的危险不是语法报错，而是合法代码构造了另一套电路，普通随机输入还可能暂时看不出差异。",
          "调试运算符时分四步：核对类别，核对输入位宽与 signed，核对结果位宽，选择能区分候选公式的反例。A=0010、B=0100 能区分 & 与 &&；A=1111、B=0001 能暴露加法进位丢失；X=1100 能暴露左移截断。"
        ],
        "code": "// 明确将两组逻辑结果合并\nassign y = (a & b) | (c & d);\n// 明确表达整体条件（讲解）\n// if ( ((A & B) != 4'b0000) && enable ) ...",
        "hardware": "括号不额外制造硬件，而是规定表达式连接的层次，让综合出的网络符合意图。",
        "pitfalls": [
          "代码能通过语法检查就认为优先级符合规格。",
          "只用全零测试复杂表达式。"
        ],
        "check": {
          "question": "定位“按位与”误写成“逻辑与”，哪组输入最有区分力？",
          "options": [
            "A=0000,B=0000",
            "A=0010,B=0100",
            "A=1111,B=1111"
          ],
          "answer": 1,
          "explanation": "两者都非零但无重叠 1：逻辑与为 1，按位与为 0000。"
        }
      }
    ],
    "exercises": [
      {
        "id": "l3-e1",
        "title": "区分三类与运算",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l3-logical",
        "prompt": "A=0010、B=0100，下列结果哪项正确？",
        "options": [
          "A&B=0000，A&&B=1",
          "A&B=1，A&&B=0000",
          "两者都为 4 位 0000"
        ],
        "answer": 0,
        "explanation": "按位比较对应位，逻辑运算判断整体真假。",
        "hints": [
          "两个向量都不是零。"
        ]
      },
      {
        "id": "l3-e2",
        "title": "保留未知值信息",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l3-compare",
        "prompt": "某测试平台要明确判断变量是否为 4'b10x1，应选哪种比较？",
        "options": [
          "=",
          "===",
          "+"
        ],
        "answer": 1,
        "explanation": "=== 可逐位比较 0/1/X/Z，并返回确定真假；它主要服务四态验证。",
        "hints": [
          "普通 == 可能无法确定。"
        ]
      },
      {
        "id": "l3-e3",
        "title": "归约异或的含义",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l3-reduction",
        "prompt": "输入 4'b0111 的 ^A 等于几？只填 0 或 1。",
        "starter": "// ^4'b0111 = ___",
        "solution": "1",
        "accepted": [
          "1"
        ],
        "explanation": "有三个 1，是奇数，异或归约结果为 1。",
        "hints": [
          "两个 1 异或会相互抵消。"
        ]
      },
      {
        "id": "l3-e4",
        "title": "逐位掩码与差异检测",
        "type": "code",
        "difficulty": 2,
        "sectionId": "l3-bitwise",
        "prompt": "给定四位 a、b，输出 both=a&b，diff=a^b。",
        "starter": "module exercise (a, b, both, diff);\n  input [3:0] a;\n  input [3:0] b;\n  output [3:0] both;\n  output [3:0] diff;\n  assign both = 4'b0000;\n  assign diff = 4'b0000;\nendmodule",
        "solution": "module exercise (a, b, both, diff);\n  input [3:0] a;\n  input [3:0] b;\n  output [3:0] both;\n  output [3:0] diff;\n  assign both = a & b;\n  assign diff = a ^ b;\nendmodule",
        "explanation": "掩码只保留对应位同时为 1 的位置，异或则保留两输入不同的位置。",
        "hints": [
          "用 1010 与 1100 手算第一组非零例子。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 4
          },
          {
            "name": "b",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "both",
            "width": 4
          },
          {
            "name": "diff",
            "width": 4
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0
            },
            "expected": {
              "both": 0,
              "diff": 0
            }
          },
          {
            "inputs": {
              "a": 10,
              "b": 12
            },
            "expected": {
              "both": 8,
              "diff": 6
            }
          },
          {
            "inputs": {
              "a": 15,
              "b": 0
            },
            "expected": {
              "both": 0,
              "diff": 15
            }
          },
          {
            "inputs": {
              "a": 15,
              "b": 15
            },
            "expected": {
              "both": 15,
              "diff": 0
            }
          },
          {
            "inputs": {
              "a": 2,
              "b": 4
            },
            "expected": {
              "both": 0,
              "diff": 6
            }
          },
          {
            "inputs": {
              "a": 5,
              "b": 10
            },
            "expected": {
              "both": 0,
              "diff": 15
            }
          }
        ]
      },
      {
        "id": "l3-e5",
        "title": "四位奇偶校验",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l3-reduction",
        "prompt": "y=1 当且仅当输入 x 中有奇数个 1。用 x[0] 到 x[3] 的异或实现，不使用归约语法。",
        "starter": "module exercise (x, y);\n  input [3:0] x;\n  output y;\n  assign y = x[0] | x[1] | x[2] | x[3];\nendmodule",
        "solution": "module exercise (x, y);\n  input [3:0] x;\n  output y;\n  assign y = x[0] ^ x[1] ^ x[2] ^ x[3];\nendmodule",
        "explanation": "异或统计的是 1 的奇偶性；或只能判断是否有 1，遇到两个 1 时就会错。",
        "hints": [
          "检查 x=0011。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "x",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "x": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 2
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 4
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 5
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 6
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 7
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 8
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 9
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 10
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 11
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 12
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "x": 13
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 14
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "x": 15
            },
            "expected": {
              "y": 0
            }
          }
        ]
      },
      {
        "id": "l3-e6",
        "title": "四位逻辑移位",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l3-shift",
        "prompt": "输出 left 是 x 左移一位后保留低四位，right 是逻辑右移一位。",
        "starter": "module exercise (x, left, right);\n  input [3:0] x;\n  output [3:0] left;\n  output [3:0] right;\n  assign left = x >> 1;\n  assign right = x << 1;\nendmodule",
        "solution": "module exercise (x, left, right);\n  input [3:0] x;\n  output [3:0] left;\n  output [3:0] right;\n  assign left = x << 1;\n  assign right = x >> 1;\nendmodule",
        "explanation": "左移低位补 0 且丢高位，逻辑右移高位补 0。四位 1100 左移一位为 1000。",
        "hints": [
          "在四个方格里移动位。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "x",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "left",
            "width": 4
          },
          {
            "name": "right",
            "width": 4
          }
        ],
        "vectors": [
          {
            "inputs": {
              "x": 0
            },
            "expected": {
              "left": 0,
              "right": 0
            }
          },
          {
            "inputs": {
              "x": 1
            },
            "expected": {
              "left": 2,
              "right": 0
            }
          },
          {
            "inputs": {
              "x": 3
            },
            "expected": {
              "left": 6,
              "right": 1
            }
          },
          {
            "inputs": {
              "x": 8
            },
            "expected": {
              "left": 0,
              "right": 4
            }
          },
          {
            "inputs": {
              "x": 12
            },
            "expected": {
              "left": 8,
              "right": 6
            }
          },
          {
            "inputs": {
              "x": 15
            },
            "expected": {
              "left": 14,
              "right": 7
            }
          }
        ]
      },
      {
        "id": "l3-e7",
        "title": "拼出一个八位字",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l3-concat",
        "prompt": "a、b 各四位。令 packed 高四位是 a、低四位是 b。",
        "starter": "module exercise (a, b, packed);\n  input [3:0] a;\n  input [3:0] b;\n  output [7:0] packed;\n  assign packed = {b, a};\nendmodule",
        "solution": "module exercise (a, b, packed);\n  input [3:0] a;\n  input [3:0] b;\n  output [7:0] packed;\n  assign packed = {a, b};\nendmodule",
        "explanation": "拼接从左到右对应高位到低位，A=0xA、B=0x5 时应为 0xA5。",
        "hints": [
          "只输入 A=B 不能暴露顺序写反。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 4
          },
          {
            "name": "b",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "packed",
            "width": 8
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0
            },
            "expected": {
              "packed": 0
            }
          },
          {
            "inputs": {
              "a": 10,
              "b": 5
            },
            "expected": {
              "packed": 165
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 15
            },
            "expected": {
              "packed": 31
            }
          },
          {
            "inputs": {
              "a": 15,
              "b": 1
            },
            "expected": {
              "packed": 241
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 15
            },
            "expected": {
              "packed": 15
            }
          }
        ]
      },
      {
        "id": "l3-e8",
        "title": "嵌套条件四选一",
        "type": "code",
        "difficulty": 3,
        "sectionId": "l3-conditional",
        "prompt": "s=00/01/10/11 时，分别选择 a/b/c/d，所有数据端口均为一位。",
        "starter": "module exercise (a, b, c, d, s, y);\n  input a;\n  input b;\n  input c;\n  input d;\n  input [1:0] s;\n  output y;\n  assign y = s[0] ? b : a;\nendmodule",
        "solution": "module exercise (a, b, c, d, s, y);\n  input a;\n  input b;\n  input c;\n  input d;\n  input [1:0] s;\n  output y;\n  assign y = s[1] ? (s[0] ? d : c) : (s[0] ? b : a);\nendmodule",
        "explanation": "高选择位决定进入低组或高组，低选择位在所选两项中选择。",
        "hints": [
          "画出两层 2:1 MUX。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 1
          },
          {
            "name": "b",
            "width": 1
          },
          {
            "name": "c",
            "width": 1
          },
          {
            "name": "d",
            "width": 1
          },
          {
            "name": "s",
            "width": 2
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "c": 0,
              "d": 0,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 0,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 0,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 0,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 0,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 1,
              "d": 0,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 1,
              "d": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 1,
              "d": 0,
              "s": 2
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 1,
              "d": 0,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 1,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 1,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 1,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "c": 0,
              "d": 1,
              "s": 3
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 1,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 1,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 1,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "c": 0,
              "d": 1,
              "s": 3
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "c": 1,
              "d": 1,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "c": 1,
              "d": 1,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "c": 1,
              "d": 1,
              "s": 2
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "c": 1,
              "d": 1,
              "s": 3
            },
            "expected": {
              "y": 1
            }
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "title": "模块、接口与层级组合",
    "subtitle": "全加器、串行进位、参数覆盖与 generate",
    "sourceFile": "Lecture04.pdf",
    "sourcePages": 20,
    "available": true,
    "summary": "用清楚的端口契约组织复杂硬件。通过一位全加器搭四位加法器，再用参数和 generate 让重复结构自动展开，理解模块复用增加的是硬件实例。",
    "objectives": [
      "写出完整模块定义及方向、位宽接口",
      "比较位置连接与命名连接",
      "沿进位链追踪每一个端口与中间节点",
      "解释参数覆盖和 generate 的展开时机"
    ],
    "sections": [
      {
        "id": "l4-interface",
        "title": "4.1 模块接口就是可检查的电路契约",
        "pages": "2–7",
        "body": [
          "第 5 页将模块分成接口与内部行为。module 名称说明电路类型，端口清单说明外界能连接什么，声明指出每个端口方向和宽度，endmodule 封闭范围。模块内部可包含网络声明、子模块、门实例、连续赋值和过程块等内容。",
          "设计接口时必须先回答数据方向：input 由外部驱动，output 向外部提供结果，inout 用于双向连接。输出端口不是软件函数的临时变量，而是模块边界上的电路节点；同一个模块可以有多个输出，也可以在内部含很多子电路。",
          "第 6 页列出 module_items，并建议先声明再引用信号。将声明、实例和逻辑按清楚的阅读顺序排列能减少隐式网络与拼写问题；但这种文本组织习惯不是门级并发电路的执行时间表。"
        ],
        "code": "module fulladd (Cin, x, y, s, Cout);\n  input Cin, x, y;\n  output s, Cout;\n  assign s = x ^ y ^ Cin;\n  assign Cout = (x & y) | (x & Cin) | (y & Cin);\nendmodule",
        "hardware": "一个三输入、两输出的组合模块：s 是奇偶和，Cout 是至少两个输入为 1 的多数逻辑。",
        "pitfalls": [
          "把端口清单与实际声明写出不同的拼写。",
          "漏写输出方向，依赖隐式信号掩盖接口错误。"
        ],
        "check": {
          "question": "fulladd 中 x、y、Cin 是一位输入，输出 s、Cout 各一位。它描述几个独立输出信号？",
          "options": [
            "1",
            "2",
            "3"
          ],
          "answer": 1,
          "explanation": "和位与进位是两个不同的输出节点。"
        }
      },
      {
        "id": "l4-ports",
        "title": "4.2 向量端口的范围与顺序",
        "pages": "7–8",
        "body": [
          "端口范围写成 [msb:lsb]，这里的标签可为常数表达式，未必从零开始。第 8 页 input [15:12] addr 只有四位；parameter word=32 后 input [word-1:0] addr 才是三十二位。把最大索引当位数会让模块连接出错。",
          "升序范围如 [0:3] 同样包含四位，但左端 0 是表达式意义上的高位一端。它与 [3:0] 的数值位序不同，尤其在分段连接和拼接中要标注对应关系。网页多数练习统一降序范围，以便数值显示与常见二进制阅读一致；课件原例的升序范围仍要会读。",
          "模块连接要核对方向、宽度和含义三件事。两根四位总线宽度相同，也可能一根编码温度、一根编码状态，不能仅因尺寸相同就连接。给选择信号、地址、数据、进位取清楚的名字是为了让接口契约可检查。"
        ],
        "code": "input a, b, sel;        // 3 个一位端口\noutput [7:0] result;    // 8 位\ninout [15:0] data_bus;  // 16 位双向\ninput [15:12] addr;     // 4 位，并非 16 位",
        "hardware": "向量端口是一组并行引脚或内部连线；索引的方向决定如何解释和排列这些线。",
        "pitfalls": [
          "把 [15:12] 看成十六位端口。",
          "连接升序与降序总线时只核对宽度、不核对位序。"
        ],
        "check": {
          "question": "[0:3] 与 [3:0] 的共同点是什么？",
          "options": [
            "都只有 3 位",
            "都包含 4 位",
            "它们的每个数值位序完全一样"
          ],
          "answer": 1,
          "explanation": "两者位数均为四，但索引方向及位串映射不同。"
        }
      },
      {
        "id": "l4-instances",
        "title": "4.3 实例化：电路复用与两种连接风格",
        "pages": "9–11",
        "body": [
          "一个模块定义像一个可重用电路的图样，实例化表示在父电路里放入一个具体子电路。四次 fulladd 实例不是调用同一个软件函数四次，而是让四个一位加法器同时存在，并通过线相连。实例名必须唯一，便于层级定位。",
          "位置连接按被实例化模块声明中的端口顺序接线。例如 fulladd u0(Cin,a,b,s,Cout) 必须严格遵循定义的 Cin,x,y,s,Cout。漏一个信号、交换两个信号，可能仍是语法合法却功能错误；空端口也必须显式留下位置。",
          "命名连接 .Cin(carry)、.x(A[0]) 直接写明子端口与父信号配对，列出顺序可变。模块接口较多时优先使用命名连接，阅读者无需来回数位置；不过子端口拼写和父信号宽度仍要检查，命名连接并不消除所有接线错误。"
        ],
        "code": "// 子模块定义的顺序：Cin, x, y, s, Cout\nfulladd u0 (carryin, X[0], Y[0], S[0], C1);\n// 同一个功能的命名连接\nfulladd u1 (.Cin(C1), .x(X[1]), .y(Y[1]),\n            .s(S[1]), .Cout(C2));",
        "hardware": "每个 fulladd 实例都对应独立组合网络；命名方式只改变描述接口的方式，不增加或减少硬件。",
        "pitfalls": [
          "混淆模块名与实例名。",
          "以为实例化四次是让一只加法器分四个时钟工作。"
        ],
        "check": {
          "question": "fulladd stage0(...) 中 fulladd 与 stage0 分别是什么？",
          "options": [
            "模块类型、实例名字",
            "两个输入名",
            "实例名字、模块类型"
          ],
          "answer": 0,
          "explanation": "模块定义可重复使用，但每个具体实例需要可区分的名字。"
        }
      },
      {
        "id": "l4-ripple",
        "title": "4.4 四位串行进位：从一位规格到整条链",
        "pages": "12–13",
        "body": [
          "第 12 页的一位全加器接收 x、y、Cin，产生 s 与 Cout。验证它有八种二值输入情况，最大输入和为 3，必须用两个输出位表示。用 s=x^y^Cin 与多数逻辑实现，有助于逐门理解进位为何在至少两位为 1 时产生。",
          "第 13 页四个实例中，第 0 位从外部 carryin 开始；第 i 位的 Cout 必须连接第 i+1 位的 Cin。内部 C[1]、C[2]、C[3] 是三段进位连线，carryout 则是最高位的输出。不要把各级进位全部接回原始 carryin。",
          "例如 X=1111、Y=0000、carryin=1，低位先产生进位，随后逐级传到最高位，输出 S=0000、carryout=1。逻辑上各级同时存在，真实信号传播却需要时间；“并发硬件”并不代表所有输出没有传播延时。"
        ],
        "code": "wire [3:1] C;\nfulladd stage0 (carryin, X[0], Y[0], S[0], C[1]);\nfulladd stage1 (C[1], X[1], Y[1], S[1], C[2]);\nfulladd stage2 (C[2], X[2], Y[2], S[2], C[3]);\nfulladd stage3 (.Cin(C[3]), .x(X[3]), .y(Y[3]),\n                .s(S[3]), .Cout(carryout));",
        "hardware": "四个一位全加器横向排列，进位从最低位传向最高位；各和位取自对应级。",
        "pitfalls": [
          "最高位输出误接到 carryin，形成错误反馈。",
          "把每一级 Cin 都接成父模块的 carryin。"
        ],
        "check": {
          "question": "四位 X=1111、Y=0000、carryin=1，完整结果是什么？",
          "options": [
            "S=1111, carryout=0",
            "S=0000, carryout=1",
            "S=0001, carryout=0"
          ],
          "answer": 1,
          "explanation": "15+0+1=16，二进制 10000。"
        }
      },
      {
        "id": "l4-params",
        "title": "4.5 每个实例可以有自己的参数",
        "pages": "14–17",
        "body": [
          "参数在设计展开时配置一个实例的尺寸或常量。课件列出 defparam 实例.参数=值，以及 #(值列表) 的位置覆盖。后者按参数声明顺序匹配，因此参数变多时应特别小心；命名参数覆盖 #(.n(8),.logn(3)) 通常更清楚。",
          "第 15 页 bit_count 把 n 位输入中 1 的数量写到 Count。数量范围是 0..n，n=8 时包括 8，因此至少需要四位。课件用 output [logn:0]，当 logn=3 时正好四位；名字叫 logn 不等于声明宽度就是 logn 位。",
          "第 16–17 页 common 先用按位 XNOR 得到相同位标记 T，再统计 T 的 1。这把逐位关系与数量关系分成两层，接口十分清楚。两个 common 的 bit_count 实例可以有不同参数，说明参数不是运行期全局变量，也不必所有实例共享同一值。"
        ],
        "code": "// 课件写法之一\nbit_count #(8, 3) cbits (T, C);\n// 易读的命名参数覆盖\nbit_count #(.n(8), .logn(3)) cbits_named (T, C);\n// 相同位标记\nassign T = ~(X ^ Y);",
        "hardware": "八组同或关系产生八位标记，后接能输出 0..8 的计数网络；参数配置展开出的宽度。",
        "pitfalls": [
          "8 位输入的 1 计数仅用 3 位输出，无法表示 8。",
          "把参数覆盖当作运行期间改线。"
        ],
        "check": {
          "question": "统计 8 位输入中 1 的个数，完整输出至少几位？",
          "options": [
            "3",
            "4",
            "8"
          ],
          "answer": 1,
          "explanation": "需要表示 0 到 8，三位最大只能到 7。"
        }
      },
      {
        "id": "l4-generate",
        "title": "4.6 generate 与过程循环的根本差别",
        "pages": "18–19",
        "body": [
          "第 18 页引入 generate，让重复子模块实例按参数数量展开。genvar 是展开用的索引，不是运行中变化的数据寄存器；n=4 时会得到四个真实的 fulladd 实例，而不是仿真运行时才决定是否创建门。",
          "第 19 页 C 的范围为 [n:0]，总计 n+1 个进位节点：C[0] 接外部 carryin，C[n] 接 carryout，第 i 级连接 C[i] 与 C[i+1]。这种一致索引方式减少第一位、最后一位的特殊处理，但循环上界必须与 n 匹配。",
          "命名块 begin:addbit 使展开后的层级清楚，如 addbit[2].stage。课件把 genvar 简述为正整数，实际从 0 开始的示例本身就说明索引不应机械地只理解成大于零。过程 for 用 integer 写行为计算，generate for 用 genvar 展开结构，两者用途不同。"
        ],
        "code": "wire [n:0] C;\nassign C[0] = carryin;\nassign carryout = C[n];\ngenvar i;\ngenerate\n  for (i=0; i<n; i=i+1) begin:addbit\n    fulladd stage (C[i], X[i], Y[i], S[i], C[i+1]);\n  end\nendgenerate",
        "hardware": "参数 n 指定展开出的全加器数量，C[i] 把相邻实例连成静态结构。",
        "pitfalls": [
          "把 generate 当作每个时钟执行一次的循环。",
          "使用 i<=n 导致多展开一级并越界引用 X[n]。"
        ],
        "check": {
          "question": "n=4，generate for(i=0;i<n;i=i+1) 会展开几个实例？",
          "options": [
            "3",
            "4",
            "5"
          ],
          "answer": 1,
          "explanation": "索引依次为 0、1、2、3，共四个实例。"
        }
      },
      {
        "id": "l4-audit",
        "title": "4.7 层级电路的接线调试清单",
        "pages": "20（整课回顾）",
        "body": [
          "调试层级电路先固定子模块规格，再检查父模块接线。若一位 fulladd 本身八个向量全部正确，而四位加法器失败，就优先查级间进位、位索引和输出位序；不要立刻重写已验证的子模块。",
          "选择测试时关注结构边界。0000+0000 检查零值，0001+0001 检查第一段进位，0111+0001 检查跨多位进位，1111+0001 检查最终 carryout。只测试没有进位的输入，很难发现串行链路的接线问题。",
          "网页代码题把层级目标展开为等价的单模块连续表达式来检查功能，真正的模块实例、参数覆盖与 generate 则以源代码讲解和概念题检查。这是功能验证的边界：通过加法向量不能证明你真的用了四个指定 fulladd 实例，结构要求还需代码审查或综合查看。"
        ],
        "code": "// 等价功能参考，不声称保留原始四级结构\nassign total = {1'b0, X} + {1'b0, Y} + carryin;\n// 四个结构边界用例：0+0，1+1，7+1，15+1",
        "hardware": "同一逻辑函数可以有不同结构实现；功能测试验证输入输出，结构审查验证模块组织与连接。",
        "pitfalls": [
          "把功能通过理解为已满足所有层级结构要求。",
          "只用不产生进位的测试向量验证进位链。"
        ],
        "check": {
          "question": "为了检查最高位 carryout，哪组四位加法输入最直接？",
          "options": [
            "0000+0000",
            "0001+0010",
            "1111+0001"
          ],
          "answer": 2,
          "explanation": "15+1=16 会把进位传播到最外部 carryout。"
        }
      }
    ],
    "exercises": [
      {
        "id": "l4-e1",
        "title": "输出方向声明",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l4-interface",
        "prompt": "填入声明模块输出端口的关键字。",
        "starter": "module block1 (a, y);\n  input a;\n  ___ y;\n  assign y=a;\nendmodule",
        "solution": "output",
        "accepted": [
          "output"
        ],
        "explanation": "output 使 y 成为向父电路提供结果的连接点。",
        "hints": [
          "与 input、inout 并列。"
        ]
      },
      {
        "id": "l4-e2",
        "title": "命名连接的含义",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l4-instances",
        "prompt": "fulladd u(.Cin(c), .x(a), .y(b), .s(s), .Cout(co)); 中 .x(a) 的意思是什么？",
        "options": [
          "把父信号 x 接到子信号 a",
          "把子模块端口 x 连接父模块信号 a",
          "定义一个叫 x 的参数"
        ],
        "answer": 1,
        "explanation": "点后名称属于子模块接口，括号里信号属于当前实例所在作用域。",
        "hints": [
          "先找“谁的端口”。"
        ]
      },
      {
        "id": "l4-e3",
        "title": "一位全加器双输出",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l4-interface",
        "prompt": "写 s=x^y^cin；cout 在三个输入中至少两个为 1 时为 1。",
        "starter": "module exercise (x, y, cin, s, cout);\n  input x;\n  input y;\n  input cin;\n  output s;\n  output cout;\n  assign s = x ^ y;\n  assign cout = x & y;\nendmodule",
        "solution": "module exercise (x, y, cin, s, cout);\n  input x;\n  input y;\n  input cin;\n  output s;\n  output cout;\n  assign s = x ^ y ^ cin;\n  assign cout = (x & y) | (x & cin) | (y & cin);\nendmodule",
        "explanation": "全加器需考虑输入进位；遗漏 cin 的半加器仅对 cin=0 的情况正确。",
        "hints": [
          "重点检查 x=0,y=0,cin=1 与 x=1,y=0,cin=1。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "x",
            "width": 1
          },
          {
            "name": "y",
            "width": 1
          },
          {
            "name": "cin",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "s",
            "width": 1
          },
          {
            "name": "cout",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "x": 0,
              "y": 0,
              "cin": 0
            },
            "expected": {
              "s": 0,
              "cout": 0
            }
          },
          {
            "inputs": {
              "x": 0,
              "y": 0,
              "cin": 1
            },
            "expected": {
              "s": 1,
              "cout": 0
            }
          },
          {
            "inputs": {
              "x": 0,
              "y": 1,
              "cin": 0
            },
            "expected": {
              "s": 1,
              "cout": 0
            }
          },
          {
            "inputs": {
              "x": 0,
              "y": 1,
              "cin": 1
            },
            "expected": {
              "s": 0,
              "cout": 1
            }
          },
          {
            "inputs": {
              "x": 1,
              "y": 0,
              "cin": 0
            },
            "expected": {
              "s": 1,
              "cout": 0
            }
          },
          {
            "inputs": {
              "x": 1,
              "y": 0,
              "cin": 1
            },
            "expected": {
              "s": 0,
              "cout": 1
            }
          },
          {
            "inputs": {
              "x": 1,
              "y": 1,
              "cin": 0
            },
            "expected": {
              "s": 0,
              "cout": 1
            }
          },
          {
            "inputs": {
              "x": 1,
              "y": 1,
              "cin": 1
            },
            "expected": {
              "s": 1,
              "cout": 1
            }
          }
        ]
      },
      {
        "id": "l4-e4",
        "title": "追踪进位链接线",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l4-ripple",
        "prompt": "第 2 位 fulladd 的 Cin 应连接哪里？",
        "options": [
          "第 1 位的 Cout",
          "外部 carryin",
          "自己的 s"
        ],
        "answer": 0,
        "explanation": "串行进位必须由低一位向高一位传递。",
        "hints": [
          "按位写出 C[1]、C[2]、C[3]。"
        ]
      },
      {
        "id": "l4-e5",
        "title": "generate 的索引类型",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l4-generate",
        "prompt": "填入用于 generate for 索引声明的类型。",
        "starter": "___ i;\ngenerate\n  for (i=0; i<n; i=i+1) begin:addbit\n    // repeated instances\n  end\nendgenerate",
        "solution": "genvar",
        "accepted": [
          "genvar"
        ],
        "explanation": "genvar 在设计展开阶段标识重复结构的各个实例。",
        "hints": [
          "它不是运行期 integer 数据寄存器。"
        ]
      },
      {
        "id": "l4-e6",
        "title": "位计数器输出宽度",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l4-params",
        "prompt": "parameter n=8, logn=3; output [logn:0] Count; 此输出有几位？",
        "options": [
          "3",
          "4",
          "8"
        ],
        "answer": 1,
        "explanation": "[3:0] 是四位，可以表示 0..8。",
        "hints": [
          "范围两端都计入。"
        ]
      },
      {
        "id": "l4-e7",
        "title": "四位加法的完整结果",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l4-audit",
        "prompt": "X、Y 四位，加上 cin，将完整 5 位结果送到 total。",
        "starter": "module exercise (X, Y, cin, total);\n  input [3:0] X;\n  input [3:0] Y;\n  input cin;\n  output [4:0] total;\n  assign total = {1'b0,X} + {1'b0,Y};\nendmodule",
        "solution": "module exercise (X, Y, cin, total);\n  input [3:0] X;\n  input [3:0] Y;\n  input cin;\n  output [4:0] total;\n  assign total = {1'b0,X} + {1'b0,Y} + cin;\nendmodule",
        "explanation": "接口必须保留进位，表达式也必须包含 cin；跨级进位用例能揭示遗漏。",
        "hints": [
          "最大输入 15+15+1=31。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "X",
            "width": 4
          },
          {
            "name": "Y",
            "width": 4
          },
          {
            "name": "cin",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "total",
            "width": 5
          }
        ],
        "vectors": [
          {
            "inputs": {
              "X": 0,
              "Y": 0,
              "cin": 0
            },
            "expected": {
              "total": 0
            }
          },
          {
            "inputs": {
              "X": 0,
              "Y": 0,
              "cin": 1
            },
            "expected": {
              "total": 1
            }
          },
          {
            "inputs": {
              "X": 1,
              "Y": 1,
              "cin": 0
            },
            "expected": {
              "total": 2
            }
          },
          {
            "inputs": {
              "X": 7,
              "Y": 1,
              "cin": 0
            },
            "expected": {
              "total": 8
            }
          },
          {
            "inputs": {
              "X": 15,
              "Y": 0,
              "cin": 1
            },
            "expected": {
              "total": 16
            }
          },
          {
            "inputs": {
              "X": 15,
              "Y": 15,
              "cin": 1
            },
            "expected": {
              "total": 31
            }
          },
          {
            "inputs": {
              "X": 9,
              "Y": 6,
              "cin": 1
            },
            "expected": {
              "total": 16
            }
          }
        ]
      },
      {
        "id": "l4-e8",
        "title": "相同位标记模块",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l4-params",
        "prompt": "X、Y 各四位，same 每一位在对应输入相同时输出 1。用 XOR 与取反实现，不用 ~^。",
        "starter": "module exercise (X, Y, same);\n  input [3:0] X;\n  input [3:0] Y;\n  output [3:0] same;\n  assign same = X ^ Y;\nendmodule",
        "solution": "module exercise (X, Y, same);\n  input [3:0] X;\n  input [3:0] Y;\n  output [3:0] same;\n  assign same = ~(X ^ Y);\nendmodule",
        "explanation": "XNOR 逐位标记相同关系；原代码 XOR 正好标记相反的关系。",
        "hints": [
          "输入完全相同时应输出 1111。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "X",
            "width": 4
          },
          {
            "name": "Y",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "same",
            "width": 4
          }
        ],
        "vectors": [
          {
            "inputs": {
              "X": 0,
              "Y": 0
            },
            "expected": {
              "same": 15
            }
          },
          {
            "inputs": {
              "X": 15,
              "Y": 15
            },
            "expected": {
              "same": 15
            }
          },
          {
            "inputs": {
              "X": 10,
              "Y": 5
            },
            "expected": {
              "same": 0
            }
          },
          {
            "inputs": {
              "X": 10,
              "Y": 12
            },
            "expected": {
              "same": 9
            }
          },
          {
            "inputs": {
              "X": 3,
              "Y": 1
            },
            "expected": {
              "same": 13
            }
          },
          {
            "inputs": {
              "X": 0,
              "Y": 15
            },
            "expected": {
              "same": 0
            }
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "title": "结构与行为的三条描述路径",
    "subtitle": "门原语、连续赋值、always 与赋值调度",
    "sourceFile": "Lecture05.pdf",
    "sourcePages": 26,
    "available": true,
    "summary": "将同一个组合功能用门、表达式和过程块表达，再进入时钟边沿与阻塞/非阻塞的区别。重点不是背 = 与 <=，而是逐拍说清右侧读到旧值还是过程内新值。",
    "objectives": [
      "按输出变化选择门的上升、下降、关断延时",
      "把门级全加器改写为连续表达式",
      "区分电平敏感与边沿敏感 always",
      "逐语句与逐时钟推演阻塞及非阻塞更新"
    ],
    "sections": [
      {
        "id": "l5-primitives",
        "title": "5.1 门原语与全加器的结构实现",
        "pages": "2–7",
        "body": [
          "第 5 页给出原语实例格式：门类型、可选实例名、输出端口和输入端口。and、or、xor 等是内置类型，不需要你另写模块定义。实例名对原语可选，但给它们命名能让门级调试更清楚；普通用户模块的实例名则不能省略。",
          "第 6 页的全加器先用三只与门产生 x&y、x&Cin、y&Cin，再或起来形成 Cout；两级异或形成 s=x^y^Cin。三个输入最多相加为 3，低位 s、高位 Cout 正好组成二位结果。逐条连线比直接记模板更能检查逻辑含义。",
          "第 7 页补充 nand、nor、xnor、not 等门。课件另一版本省略了中间 wire 声明，传统工具可能创建隐式单比特网络，但这不利于发现拼写错误。学习代码应显式声明每个中间连接，尤其不能让向量被意外当成一位。"
        ],
        "code": "module fa_gates (x, y, cin, s, cout);\n  input x, y, cin;\n  output s, cout;\n  wire xy, xc, yc, t;\n  and u0 (xy, x, y);\n  and u1 (xc, x, cin);\n  and u2 (yc, y, cin);\n  or u3 (cout, xy, xc, yc);\n  xor u4 (t, x, y);\n  xor u5 (s, t, cin);\nendmodule",
        "hardware": "三只与门加一只或门产生进位，两只异或门产生和位；所有门并发存在。",
        "pitfalls": [
          "原语输入输出顺序写反。",
          "漏声明中间节点而依赖工具自动创建 wire。"
        ],
        "check": {
          "question": "全加器 Cout 何时为 1？",
          "options": [
            "恰好一个输入为 1",
            "至少两个输入为 1",
            "仅 cin=1 时"
          ],
          "answer": 1,
          "explanation": "三个输入相加达到 2 或 3 时产生进位。"
        }
      },
      {
        "id": "l5-buffers",
        "title": "5.2 普通缓冲与三态缓冲的使能极性",
        "pages": "7–8",
        "body": [
          "buf 将输入传到输出，not 则取反。bufif0、bufif1、notif0、notif1 都包含使能控制：if0 表示控制为 0 时有效，if1 表示控制为 1 时有效。notif 在有效时还对数据取反，而 bufif 保持数据极性。",
          "使能无效时三态原语输出 Z，意为释放节点。对 bufif0(y,a,en)，en=0 时 y=a，en=1 时 y=Z；如果你把 if0 看成“输出固定为零”，就会把使能极性与数据值混在一起。先写使能真值表可以避免这种误读。",
          "三态接口需要总线协议配合：某个驱动关断不代表总线变零，其他驱动可能仍在提供 0/1，所有驱动都关断才可能留下 Z。练习中涉及 X/Z 的结果是明确的四态概念推演，不交给仅二值的代码执行子集猜测。"
        ],
        "code": "// 内置原语：输出、数据、控制\nbufif0 u0 (bus0, data, en); // en=0 时驱动 data\nbufif1 u1 (bus1, data, en); // en=1 时驱动 data\nnotif1 u2 (bus2, data, en); // en=1 时驱动 ~data",
        "hardware": "三态缓冲器相当于带可断开功能的输出级；notif 还增加数据反相。",
        "pitfalls": [
          "把 if0/if1 的数字误认为有效时的输出值。",
          "把 Z 分支改成 0，破坏共享总线的释放功能。"
        ],
        "check": {
          "question": "bufif0(y,a,en) 在 en=1 时输出什么？",
          "options": [
            "a",
            "~a",
            "Z"
          ],
          "answer": 2,
          "explanation": "if0 表示控制为 0 时有效，1 时关闭输出驱动。"
        }
      },
      {
        "id": "l5-delay",
        "title": "5.3 延时由输出跃迁决定",
        "pages": "9–11",
        "body": [
          "第 9 页把门延时分成上升、下降与关断：上升指输出变 1，下降指输出变 0，关断指输出变 Z。一个延时应用于所有相应变化，两个延时分别指定上升与下降，三态原语才有意义地指定第三个关断延时。",
          "第 10 页反相器是关键反例。not #(3,5) u(Y,A) 中，输入 A 从 0 变 1，输出应从 1 变 0，因此用下降延时 5；输入 A 从 1 变 0，输出从 0 变 1，因此用上升延时 3。不能直接按输入的上升下降选参数。",
          "这些 # 延时属于仿真模型的时序行为，不应理解成综合会自动制造精确相同的物理延时。真实器件延时与工艺、负载、路径和约束有关。本网页的功能判题不执行原语延时，延时题以事件推演方式给出答案边界。"
        ],
        "code": "not #(3,5) u_inv (Y,A);\n// A:0->1 使 Y:1->0，使用 5\n// A:1->0 使 Y:0->1，使用 3\nbufif0 #(5,6,7) u_tri (bus,data,en);\n// 三个参数依次为输出上升、下降、关断延时",
        "hardware": "同一门的输出沿不同方向变化可有不同传播时间；延时标签以输出端为参照。",
        "pitfalls": [
          "按输入跃迁方向选上升或下降延时。",
          "认为 #5 自动综合成精确 5ns 的硬件延迟。"
        ],
        "check": {
          "question": "not #(2,7) 的输入从 0 升到 1，输出采用哪个延时？",
          "options": [
            "2",
            "7",
            "0"
          ],
          "answer": 1,
          "explanation": "输出此时从 1 降到 0，所以采用下降延时 7。"
        }
      },
      {
        "id": "l5-continuous",
        "title": "5.4 连续赋值的显式、隐式与多输出",
        "pages": "12–14",
        "body": [
          "第 12 页区分先声明 wire 再 assign 的显式形式，以及 wire y=表达式 的网络声明赋值形式。二者都持续驱动网络；不要把 wire y=a&b 误读为只在仿真开始时初始化 y。变量声明初始化与网络声明赋值的语义需要区别。",
          "第 13 页复现选择器 f=(x1&x2)|(~x2&x3)，第 14 页允许一个 assign 通过逗号给多个网络赋值。为了在学习和报错时精确定位，本网页通常每个输出写一条 assign，它们仍是并发关系。表达式交换文字顺序不改变无环组合函数。",
          "课件第 14 页全加器的 s=x^y^z 使用了未在该片段中说明的 z；若它表示输入进位，完整例子应使用 Cin 或明确声明对应信号。教材代码也需要核对接口，不能因为出现在投影片里就忽略未定义名字。"
        ],
        "code": "module fa_expr (x,y,cin,s,cout);\n  input x,y,cin;\n  output s,cout;\n  assign s = x ^ y ^ cin;\n  assign cout = (x&y) | (x&cin) | (y&cin);\nendmodule",
        "hardware": "与门级全加器具有相同二值功能；连续表达式允许综合工具优化具体门结构。",
        "pitfalls": [
          "把 wire y=... 当一次初始化。",
          "照抄不明确的 z，导致意外隐式网络或编译错误。"
        ],
        "check": {
          "question": "wire y = a & b; 在网络声明语境中通常表示什么？",
          "options": [
            "只执行一次的初始化",
            "持续驱动 y 的组合关系",
            "自动创建 D 触发器"
          ],
          "answer": 1,
          "explanation": "这是隐式连续赋值形式。"
        }
      },
      {
        "id": "l5-process",
        "title": "5.5 always、initial 与敏感列表",
        "pages": "15–18",
        "body": [
          "过程语句位于 always、initial，或被过程调用的函数/任务中。always 重复响应事件，initial 从仿真开始执行一次；initial 中也可以包含循环，因此“只开始一次”不等于“里面每条语句最多执行一次”。是否可综合要结合工具和具体用途判断。",
          "第 16–17 页区分电平敏感列表与边沿事件。always @(a or b) 在 a 或 b 任何变化时执行，常用于组合逻辑或锁存描述；always @(posedge clk) 只在时钟正沿执行，常用于触发器。敏感列表的形式只是第一步，仍需核查块内部赋值是否完整。",
          "第 18 页组合选择器把 x1、x2、x3 都列入敏感列表，并覆盖 if/else。现代 Verilog 2001 常用 always @(*) 自动包含所读信号，减少漏项造成的仿真更新错误。一个组合过程通常用阻塞赋值并确保所有输出在所有路径都有值。"
        ],
        "code": "always @(*) begin\n  if (x2) f = x1;\n  else f = x3;\nend\n// 与 always @(posedge clk) 的边沿采样作用不同",
        "hardware": "完整分支的组合 always 可对应 MUX；边沿敏感过程通常指向触发器。",
        "pitfalls": [
          "敏感列表漏掉数据端，只对控制端变化更新输出。",
          "把 always 的字面意思理解为无条件高速循环运行。"
        ],
        "check": {
          "question": "组合 MUX 的敏感列表只写控制 s、不写数据 a/b，会有什么问题？",
          "options": [
            "数据变化时仿真可能不重新执行",
            "必然提高速度",
            "自动保存所有历史"
          ],
          "answer": 0,
          "explanation": "控制未变时数据变化可能不触发该过程，仿真与组合规格不一致。"
        }
      },
      {
        "id": "l5-edge",
        "title": "5.6 D 触发器：把“何时采样”写清楚",
        "pages": "19",
        "body": [
          "第 19 页 D 触发器使用 always @(posedge Clock)。只有时钟正沿才采样 D，两个正沿之间即使 D 改变，Q 也应保持上次采样值。数据与时钟因此扮演不同角色，不能把 D 的任意变化也加入相同边沿过程而仍声称是普通 D 触发器。",
          "课件的单寄存器示例写 Q=D；单个过程单个赋值时常能表达采样，但在多个寄存器和多个过程协同时，阻塞赋值容易产生顺序与竞态问题。工程习惯改为 Q<=D，用非阻塞更新表达各寄存器在同一边沿读取旧状态。",
          "这个初始示例没有复位，仿真开始时 Q 可能为 X。想得到可预测上电状态，必须按目标实现与系统规格设计复位或初始化。学习时先标出采样边沿，再逐边沿填写 Q；不要把 D 在边沿之间的变化直接画到 Q。"
        ],
        "code": "module dff (D,Clock,Q);\n  input D,Clock;\n  output reg Q;\n  always @(posedge Clock)\n    Q <= D;\nendmodule",
        "hardware": "一个正沿触发 D 触发器，D 是数据端，Clock 是采样控制，Q 保存上次采样结果。",
        "pitfalls": [
          "把 Q 当成始终跟随 D 的导线。",
          "没有复位却假定起始 Q 一定为 0。"
        ],
        "check": {
          "question": "两个正沿之间 D 由 0 变 1，普通正沿 D 触发器 Q 会怎样？",
          "options": [
            "立即变 1",
            "保持上次采样值，等下一正沿",
            "自动变 X"
          ],
          "answer": 1,
          "explanation": "触发器只在指定边沿更新。"
        }
      },
      {
        "id": "l5-blocking",
        "title": "5.7 阻塞赋值：后一句读取过程内新值",
        "pages": "20–23",
        "body": [
          "阻塞赋值 = 先完成当前赋值，再执行本过程下一句。Q1=D; Q2=Q1; 中，第二句看到的是第一句刚写入的 Q1，因此该边沿后 Q1、Q2 都成为 D。代码看似两级，实际依赖并没有保留前一级旧值。",
          "第 22 页给初始 Q1=1、Q2=0：Q1=Q2 先把 Q1 改为 0，随后 Q2=Q1 又读到 0，所以最终两者都为 0。若交换两句顺序，结果可都为 1。顺序改变结果，是理解阻塞过程的最好证据。",
          "阻塞赋值适合组合过程里按顺序计算中间量，例如先算部分和再算最终输出；前提是完整赋值且没有无意历史依赖。不能把“按顺序评估”误读为真实硬件自动在多个时钟内串行完成，每条赋值可能只是组合依赖的不同层。"
        ],
        "code": "always @(posedge clk) begin\n  Q1 = D;\n  Q2 = Q1; // 读新 Q1，因此 Q2 也得到当前 D\nend\n// 教学反例：不应把它当成规范两级移位寄存器",
        "hardware": "Q2 的输入不再是前一拍保存的 Q1，因而无法实现预期的两拍延迟链。",
        "pitfalls": [
          "按行数猜寄存器级数和延迟。",
          "把 = 改成 <= 前后结果不做逐拍验证。"
        ],
        "check": {
          "question": "初始 Q1=1,Q2=0，执行 Q1=Q2; Q2=Q1; 后是什么？",
          "options": [
            "Q1=0,Q2=0",
            "Q1=0,Q2=1",
            "Q1=1,Q2=1"
          ],
          "answer": 0,
          "explanation": "第二句读到的是第一句已经更新后的 Q1=0。"
        }
      },
      {
        "id": "l5-nonblocking",
        "title": "5.8 非阻塞赋值：先读旧值，再提交更新",
        "pages": "20–22，24",
        "body": [
          "非阻塞赋值 <= 在当前过程评估右侧，并把更新安排到相应的非阻塞更新阶段。对于同一时钟边沿的寄存器链，可以先按边沿前旧状态计算所有下一值，再一起提交。这个模型比笼统地说“所有语句完全并行执行”更准确。",
          "Q1<=D; Q2<=Q1; 中 Q2 读取旧 Q1，因此形成真正的两级流水。第 22 页的交换例 Q1<=Q2; Q2<=Q1; 在旧值 1、0 下得到新值 0、1；交换这两个独立目标的语句顺序不会改变该例结果。",
          "“顺序不重要”有条件：如果同一过程多次对同一个变量安排非阻塞赋值，后面的安排可能覆盖前面的安排；多个过程写同一寄存器还会形成冲突或竞态。规范设计让一个寄存器有清楚的唯一过程驱动，并对下一值关系逐项检查。"
        ],
        "code": "always @(posedge clk) begin\n  Q1 <= D;\n  Q2 <= Q1; // 读边沿前旧 Q1\nend\n// 推演：next_Q1=D_old; next_Q2=Q1_old;",
        "hardware": "两只共用时钟的 D 触发器串接，Q1 保存本拍输入，Q2 保存上一拍 Q1。",
        "pitfalls": [
          "把 <= 解释成右侧也等到以后才读取。",
          "同一个寄存器被多个过程驱动。"
        ],
        "check": {
          "question": "旧 Q1=1,Q2=0，执行 Q1<=Q2; Q2<=Q1; 后是什么？",
          "options": [
            "0,0",
            "0,1",
            "1,1"
          ],
          "answer": 1,
          "explanation": "两个右侧在更新前取值，所以交换旧值。"
        }
      },
      {
        "id": "l5-rules",
        "title": "5.9 按硬件意图选择赋值并设计反例",
        "pages": "25–26",
        "body": [
          "第 25 页给出实用建议：组合过程使用阻塞赋值，时钟时序过程使用非阻塞赋值。它不是单纯的排版偏好，而是让代码的数据依赖与门级组合计算、同步寄存器采样分别一致，便于团队审查和仿真。",
          "检查组合代码时找完整敏感列表、默认值和所有分支的赋值；检查时序代码时写出旧状态与下一状态表。对于 Q1、Q2 这类链，只看第一拍两者碰巧相同很危险，应让输入随拍变化，才能区分直接复制与真正延迟一级。",
          "本网页将有时序含义的片段作为讲解或选择/填空题，避免把不支持的 always 输入静态表达式执行器。可执行题只实现相应组合关系并提供反例。正式项目仍需要真实 Verilog 仿真器、测试平台与波形验证时钟调度。"
        ],
        "code": "// 推荐组合模板\nalways @(*) begin\n  y = default_value;\n  if (select) y = data;\nend\n// 推荐时序模板\nalways @(posedge clk) begin\n  Q <= D;\nend",
        "hardware": "组合模板构造选择数据通路，时序模板在数据通路末端增加受时钟采样的状态。",
        "pitfalls": [
          "机械替换运算符，却不核对电路的时序规格。",
          "只用恒定 D 检查两级寄存器链。"
        ],
        "check": {
          "question": "为了区分两级寄存器链和两路直接复制，最有用的输入是什么？",
          "options": [
            "D 永远为 0",
            "D 随不同时钟拍改变",
            "不提供时钟"
          ],
          "answer": 1,
          "explanation": "变化的输入能暴露 Q2 应比 Q1 延迟一拍的关系。"
        }
      }
    ],
    "exercises": [
      {
        "id": "l5-e1",
        "title": "门原语端口约定",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l5-primitives",
        "prompt": "xor u0(t,a,b) 中 t 代表什么？",
        "options": [
          "输出",
          "第一个输入",
          "门延时"
        ],
        "answer": 0,
        "explanation": "门原语输出在前，后面是输入；u0 是实例名。",
        "hints": [
          "不要按“输入先写”的直觉判断。"
        ]
      },
      {
        "id": "l5-e2",
        "title": "反相器的传播延时",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l5-delay",
        "prompt": "not #(3,8) u(y,a); a 从 0 变 1，y 的相应变化使用哪个延时？",
        "options": [
          "3",
          "8",
          "11"
        ],
        "answer": 1,
        "explanation": "a 上升使 y 下降，使用第二个参数下降延时 8。",
        "hints": [
          "以输出跃迁为参照。"
        ]
      },
      {
        "id": "l5-e3",
        "title": "规范寄存器赋值",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l5-edge",
        "prompt": "在正沿过程里给寄存器 Q 更新 D，填推荐的赋值运算符。",
        "starter": "always @(posedge clk) Q ___ D;",
        "solution": "<=",
        "accepted": [
          "<="
        ],
        "explanation": "时钟过程用非阻塞赋值，让寄存器读取旧状态并在更新阶段统一提交。",
        "hints": [
          "两个字符。"
        ]
      },
      {
        "id": "l5-e4",
        "title": "阻塞交换反例",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l5-blocking",
        "prompt": "旧 Q1=1,Q2=0，执行 Q2=Q1; Q1=Q2; 后得到什么？",
        "options": [
          "Q1=0,Q2=0",
          "Q1=1,Q2=1",
          "Q1=0,Q2=1"
        ],
        "answer": 1,
        "explanation": "第一句先把 Q2 设为 1，第二句读到新 Q2=1。",
        "hints": [
          "与课件第 22 页相反顺序比较。"
        ]
      },
      {
        "id": "l5-e5",
        "title": "非阻塞链逐拍",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l5-nonblocking",
        "prompt": "某正沿前 Q1=0,Q2=1,D=1，执行 Q1<=D;Q2<=Q1;，正沿更新后是什么？",
        "options": [
          "Q1=1,Q2=1",
          "Q1=1,Q2=0",
          "Q1=0,Q2=1"
        ],
        "answer": 1,
        "explanation": "Q1 读取 D=1，Q2 读取旧 Q1=0。",
        "hints": [
          "先写 next_Q1 和 next_Q2，再提交。"
        ]
      },
      {
        "id": "l5-e6",
        "title": "连续赋值实现选择电路",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l5-continuous",
        "prompt": "用组合表达式实现 x2=1 时 f=x1，x2=0 时 f=x3。",
        "starter": "module exercise (x1, x2, x3, f);\n  input x1;\n  input x2;\n  input x3;\n  output f;\n  assign f = (x1 & x2) | (x2 & x3);\nendmodule",
        "solution": "module exercise (x1, x2, x3, f);\n  input x1;\n  input x2;\n  input x3;\n  output f;\n  assign f = (x1 & x2) | (~x2 & x3);\nendmodule",
        "explanation": "x2=0 时第二支路必须放行 x3，所以它使用 ~x2；原代码此时两路都被关闭。",
        "hints": [
          "检查 x1=0,x2=0,x3=1。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "x1",
            "width": 1
          },
          {
            "name": "x2",
            "width": 1
          },
          {
            "name": "x3",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "f",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "x1": 0,
              "x2": 0,
              "x3": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "x1": 0,
              "x2": 0,
              "x3": 1
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "x1": 0,
              "x2": 1,
              "x3": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "x1": 0,
              "x2": 1,
              "x3": 1
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "x1": 1,
              "x2": 0,
              "x3": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "x1": 1,
              "x2": 0,
              "x3": 1
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "x1": 1,
              "x2": 1,
              "x3": 0
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "x1": 1,
              "x2": 1,
              "x3": 1
            },
            "expected": {
              "f": 1
            }
          }
        ]
      },
      {
        "id": "l5-e7",
        "title": "从全加器门图合成表达式",
        "type": "code",
        "difficulty": 2,
        "sectionId": "l5-primitives",
        "prompt": "输入 a、b、cin，sum 为奇偶和，carry 为至少两输入为 1。将门图写成两条 assign。",
        "starter": "module exercise (a, b, cin, sum, carry);\n  input a;\n  input b;\n  input cin;\n  output sum;\n  output carry;\n  assign sum = 1'b0;\n  assign carry = 1'b0;\nendmodule",
        "solution": "module exercise (a, b, cin, sum, carry);\n  input a;\n  input b;\n  input cin;\n  output sum;\n  output carry;\n  assign sum = a ^ b ^ cin;\n  assign carry = (a & b) | (a & cin) | (b & cin);\nendmodule",
        "explanation": "异或链对应和位，三路两两与再或对应进位。",
        "hints": [
          "先列出输入 111 与 110 的不同和位。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "a",
            "width": 1
          },
          {
            "name": "b",
            "width": 1
          },
          {
            "name": "cin",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "sum",
            "width": 1
          },
          {
            "name": "carry",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "cin": 0
            },
            "expected": {
              "sum": 0,
              "carry": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 0,
              "cin": 1
            },
            "expected": {
              "sum": 1,
              "carry": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "cin": 0
            },
            "expected": {
              "sum": 1,
              "carry": 0
            }
          },
          {
            "inputs": {
              "a": 0,
              "b": 1,
              "cin": 1
            },
            "expected": {
              "sum": 0,
              "carry": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "cin": 0
            },
            "expected": {
              "sum": 1,
              "carry": 0
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 0,
              "cin": 1
            },
            "expected": {
              "sum": 0,
              "carry": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "cin": 0
            },
            "expected": {
              "sum": 0,
              "carry": 1
            }
          },
          {
            "inputs": {
              "a": 1,
              "b": 1,
              "cin": 1
            },
            "expected": {
              "sum": 1,
              "carry": 1
            }
          }
        ]
      },
      {
        "id": "l5-e8",
        "title": "initial 的执行边界",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l5-process",
        "prompt": "initial begin repeat(10) a=a+1; end 应如何理解？",
        "options": [
          "initial 只启动一次，但内部语句可被 repeat 重复十次",
          "repeat 自动生成十个时钟",
          "initial 每拍重新启动"
        ],
        "answer": 0,
        "explanation": "initial 的一次性指过程启动；内部循环可以执行多次，并不自动提供时钟或延时。",
        "hints": [
          "区分过程启动次数与内部语句执行次数。"
        ]
      }
    ]
  },
  {
    "id": 6,
    "title": "选择、优先级与循环",
    "subtitle": "if/case/casez/casex 和过程循环的硬件含义",
    "sourceFile": "Lecture06.pdf",
    "sourcePages": 19,
    "available": true,
    "summary": "学习把条件选择、优先编码和重复计算写成完整的组合行为。每次使用控制结构，都追问分支是否覆盖、优先级在哪里、循环是否在展开硬件还是等待时间。",
    "objectives": [
      "用 if-else 与 case 描述多路选择器",
      "指出缺省赋值缺失产生的保持行为",
      "区分 case/casez/casex 的匹配与未知掩盖风险",
      "分析 for、while、repeat、forever 的终止与时间语义"
    ],
    "sections": [
      {
        "id": "l6-if",
        "title": "6.1 if-else 与完整组合赋值",
        "pages": "2–6",
        "body": [
          "if 根据条件选择一个过程语句，else 覆盖条件不成立的情况；分支中要放多条语句就使用 begin/end。第 6 页的二选一 MUX 在 s=0 时选 w0，否则选 w1，数据端与控制端都必须在组合过程的敏感列表里。",
          "组合电路要求当前输出只由当前输入决定。若 if(s) f=w1 而没有 else，当 s=0 时过程不给 f 新值，语言必须保留先前值，综合可能推导锁存器。完整 if-else 或进入块后先给默认值，是避免意外状态的关键。",
          "课件把等号显示成“= =”是排版间隔，实际相等比较必须写 ==。写代码时还要区分 if(s==0) 的比较和 f=w0 的阻塞赋值；它们符号相似，但一个计算条件，一个更新过程变量。"
        ],
        "code": "always @(*) begin\n  if (s == 1'b0) f = w0;\n  else f = w1;\nend\n// 不完整反例：if(s) f=w1; // s=0 时保持旧 f",
        "hardware": "完整分支得到 MUX；缺失赋值而保留历史可能构成电平敏感锁存器。",
        "pitfalls": [
          "把 if 后的等号写成单个 =。",
          "只写想改变输出的条件，忽略其他路径。"
        ],
        "check": {
          "question": "always @(*) if(en) q=d; 的关键风险是什么？",
          "options": [
            "en=0 时无新赋值，可能推导锁存器",
            "必然是纯导线",
            "自动增加复位"
          ],
          "answer": 0,
          "explanation": "未赋值路径保留旧值，引入存储行为。"
        }
      },
      {
        "id": "l6-ifchain",
        "title": "6.2 else-if 链表达顺序与优先级",
        "pages": "7",
        "body": [
          "第 7 页用 S=0、1、2、3 的 else-if 链实现四选一 MUX。对确定的二位 S，这四个条件互斥且覆盖所有二值情况；但含 X/Z 的仿真条件可能没有任何一个成立，因此仍要考虑默认行为与未知传播策略。",
          "一般的 if-else-if 链是有优先级的：从上往下，第一条成立的分支执行，后续不再检查。如果条件重叠，排列顺序就是功能规格的一部分；如果条件像 S==0、S==1 一样互斥，重排不会改变二值映射。",
          "写优先级逻辑先画表：哪一个请求优先、全零时输出什么、是否需要 valid 标志。不要把“文本里最后出现的条件”误认为最高优先级；那种后写覆盖前写的规则属于另一种多次赋值的过程写法。"
        ],
        "code": "always @(*) begin\n  if      (S == 2'd0) f = W[0];\n  else if (S == 2'd1) f = W[1];\n  else if (S == 2'd2) f = W[2];\n  else                f = W[3];\nend",
        "hardware": "可看成按条件选择的数据通路；条件是否互斥决定优先级是否会影响正常输入结果。",
        "pitfalls": [
          "在重叠条件链中随意交换分支。",
          "以为覆盖 0..3 就处理了所有四态输入。"
        ],
        "check": {
          "question": "if(a) y=1; else if(b) y=0; 当 a=b=1 时 y 是什么？",
          "options": [
            "1",
            "0",
            "取决于缩进"
          ],
          "answer": 0,
          "explanation": "第一条成立的分支执行，所以 a 的优先级更高。"
        }
      },
      {
        "id": "l6-case",
        "title": "6.3 case：一张显式的映射表",
        "pages": "8–9",
        "body": [
          "case 计算控制表达式，并与各分支逐位匹配。适合编码到数据的映射、状态译码和多路选择。第 9 页四选一 MUX 将 0..3 映射到 W 的四个元素，阅读时可以直接把分支抄成真值表。",
          "case 不是 C 风格会继续跌落执行的 switch，不需要用 break 阻止贯穿。每个匹配项后只跟一个语句，需要多个赋值时放 begin/end；default 为未匹配情况提供定义，既改善仿真行为，也防止某些输出保留旧值。",
          "默认值的选择要与规格一致。可以在 always 一开始给安全输出，再由 case 覆盖；也可以写完整 default。若教学中用 X 暴露非法输入，应明确那是验证策略，而不是承诺真实电路会输出一个稳定 X 电平。"
        ],
        "code": "always @(*) begin\n  f = 1'b0;\n  case(S)\n    2'd0: f=W[0];\n    2'd1: f=W[1];\n    2'd2: f=W[2];\n    2'd3: f=W[3];\n    default: f=1'b0;\n  endcase\nend",
        "hardware": "控制编码选择四条数据线之一，default 则规定控制不匹配时的结果。",
        "pitfalls": [
          "照 C 的习惯在分支里加入无意义 break。",
          "只给部分输出 default，另一些输出仍会保持旧值。"
        ],
        "check": {
          "question": "case 中某项包含两条赋值，应如何组织？",
          "options": [
            "仅缩进两行",
            "用 begin/end 包起来",
            "每行都加 break"
          ],
          "answer": 1,
          "explanation": "每个分支位置接受一个语句或一个 begin/end 复合语句。"
        }
      },
      {
        "id": "l6-wildcards",
        "title": "6.4 casez、casex 与第一条匹配",
        "pages": "10–12",
        "body": [
          "普通 case 对 0、1、X、Z 作逐位匹配；casez 将 Z 与问号位置作为无关位；casex 还把 X 当无关位。第 11 页 3'b1?? 可以匹配最高位为 1 的许多情况，适合用掩码简洁描述宽范围条件。",
          "无关位不仅可能出现在分支常量，也可能出现在待匹配表达式中，所以真实未知输入有机会被 casez/casex 忽略。尤其 casex 能把本来应该暴露的 X 错当作任何值匹配，导致仿真显得正常，却掩盖初始化或连接问题。",
          "如果多个模式都匹配，只执行第一条。第 12 页的 01x 与 0xx 重叠，前者必须放前面才能优先选中更具体的条件。读通配模式时先列它覆盖的集合，再看与前后分支是否重叠，避免仅凭模式长相猜优先级。"
        ],
        "code": "casez(state)\n  3'b1??: code=0;\n  3'b01?: code=1;\n  default: code=2;\nendcase\n// casex 会进一步把输入/模式中的 X 当无关位",
        "hardware": "通配模式可描述条件掩码和优先选择网络；未知值被忽略属于仿真匹配语义。",
        "pitfalls": [
          "认为只有分支模式中的 X/Z 才会被忽略。",
          "用 casex 无意隐藏错误输入里的 X。"
        ],
        "check": {
          "question": "哪种语句会把 X 和 Z 都作为无关位匹配？",
          "options": [
            "case",
            "casez",
            "casex"
          ],
          "answer": 2,
          "explanation": "casex 的通配范围最大，因此也最容易掩盖未知输入。"
        }
      },
      {
        "id": "l6-priority",
        "title": "6.5 优先编码器与有效标志",
        "pages": "13",
        "body": [
          "第 13 页的 W[3:0] 优先编码器选最高编号的 1：1xxx→3、01xx→2、001x→1、0001→0。虽然有多个请求同时为 1，输出仍由最高优先请求决定，这与只接受 one-hot 输入的普通编码器不同。",
          "z 在这个模块中是名为 z 的普通有效标志信号，并不是高阻字面量 1'bz。z=1 表示存在至少一个请求；W=0000 时 z=0，Y 没有有效含义。阅读代码必须区分信号名称和逻辑状态符号。",
          "工程上可让无请求时 Y=0、valid=0，便于确定性接口；课件用 Y=X 表达无意义值，意图是让验证发现错误使用无效编码。下游应先看有效标志，再使用 Y，不能在 valid=0 时仍把编码当作真实请求。"
        ],
        "code": "// 二值下的同等优先关系，明确指定无效时 Y=0\nassign Y = W[3] ? 2'd3 :\n           W[2] ? 2'd2 :\n           W[1] ? 2'd1 : 2'd0;\nassign valid = W[3] | W[2] | W[1] | W[0];",
        "hardware": "最高位优先的选择链输出编码，另一条 OR 归并链给出是否存在请求。",
        "pitfalls": [
          "把普通信号名 z 误读成高阻。",
          "W=0 时忽略 valid 仍使用编码输出。"
        ],
        "check": {
          "question": "W=4'b1011，最高编号优先编码器输出 Y 是什么？",
          "options": [
            "0",
            "1",
            "3"
          ],
          "answer": 2,
          "explanation": "W[3]=1，优先级压过其他位。"
        }
      },
      {
        "id": "l6-for",
        "title": "6.6 for 位计数：重复语句与组合展开",
        "pages": "14–16",
        "body": [
          "for 包含初始化、继续条件与迭代更新。第 16 页 Count=0 后从 k=0 到 n-1，逐次把 X[k] 累加到 Count。因为组合过程使用阻塞赋值，后一次加法读取前一次已累积的 Count，得到当前输入中的 1 数量。",
          "Count=0 是每次组合重新计算的起点，不能省略。如果省略，Count 会依赖上次过程运行结果，不再是仅由当前 X 决定的位计数。输出位宽还必须能表示 n，n=4 时要表示 0..4，因此至少三位。",
          "固定边界的可综合过程循环通常在综合时展开为组合计算结构，并不天然“每个时钟数一位”。若规格要求每拍处理一位，就要额外设计索引寄存器、累加寄存器、计数控制和完成条件，不能只在 for 外加个时钟就凭直觉推断。"
        ],
        "code": "always @(*) begin\n  Count = 0;\n  for (k=0; k<n; k=k+1)\n    Count = Count + X[k];\nend\n// 固定 n 的组合循环，不代表 n 个时钟周期",
        "hardware": "多个位值经过加法网络归并到一个计数结果；综合器可能优化具体树形或链形结构。",
        "pitfalls": [
          "漏掉 Count=0，意外把前一次结果继续累加。",
          "认为循环每迭代一次自然等待一个时钟。"
        ],
        "check": {
          "question": "四位 X 的位计数最大为 4，输出至少几位？",
          "options": [
            "2",
            "3",
            "4"
          ],
          "answer": 1,
          "explanation": "两位只能表示 0..3，三位可以表示 4。"
        }
      },
      {
        "id": "l6-while",
        "title": "6.7 while：循环条件与终止证明",
        "pages": "17",
        "body": [
          "while 在每次进入循环体前检查条件，开始即为假时执行零次。第 17 页 t=0，while(t<MSB) 把 Vector[t] 清零并递增 t；只要 MSB 是确定正值，这个循环最终会终止。",
          "漏写 t=t+1 或让更新不能接近终止条件，会形成无时间推进的无限循环，仿真可能卡住。先证明索引范围与终止条件，是写循环的重要部分；不要只看一两轮示例就认为永远安全。",
          "这个例子放在 initial 中作为初始化行为。动态迭代次数的 while 是否可综合以及资源上界如何确定，取决于结构与工具，不能一概视为便宜的循环控制器。想让硬件运行多周期算法，应显式写状态与逐周期控制。"
        ],
        "code": "initial begin\n  t=0;\n  while (t<MSB) begin\n    Vector[t]=1'b0;\n    t=t+1;\n  end\nend",
        "hardware": "在该测试式初始化例中，循环描述仿真步骤；是否对应物理存储初始化需结合目标工具。",
        "pitfalls": [
          "没有更新循环控制变量。",
          "把 initial while 的零时间多次执行当成多个时钟周期。"
        ],
        "check": {
          "question": "while 条件第一次检查即为假，循环体执行几次？",
          "options": [
            "0",
            "1",
            "无限次"
          ],
          "answer": 0,
          "explanation": "while 先判条件，再决定是否进入循环体。"
        }
      },
      {
        "id": "l6-repeat",
        "title": "6.8 repeat 与 forever 不自动创造时间",
        "pages": "18–19",
        "body": [
          "repeat(N) 重复执行固定次数，不需要显式索引。第 18 页 repeat(10) a=a+~b 在没有任何延时或事件等待时，会在同一仿真时刻内完成多次过程赋值，不代表十个时钟脉冲。循环次数和时间推进必须分开理解。",
          "forever 无限重复后面的语句，常用于测试平台时钟发生器。例如 forever #5 clk=~clk 因含 #5 才能随仿真时间翻转；如果完全没有等待条件，永久循环可能阻塞仿真，而不是生成一个“无限快的硬件”。",
          "选择循环结构时，要说明用途：for 适合有已知界限的重复行为，while 依赖条件终止，repeat 固定次数，forever 持续激励。可综合硬件仍需能解释结构与状态，本网页不对这些过程模型假装提供完整事件调度。"
        ],
        "code": "// 仅用于测试平台的时钟激励示例\ninitial begin\n  clk=0;\n  forever #5 clk=~clk;\nend\n// 周期为 10 个时间单位，因每 5 单位翻转一次",
        "hardware": "测试平台的 forever #5 是激励过程，不应当作芯片内部振荡器的可综合实现。",
        "pitfalls": [
          "把 repeat(10) 自动等同十拍。",
          "forever 内没有事件等待或延时导致零时间无限循环。"
        ],
        "check": {
          "question": "forever #5 clk=~clk 的理想时钟周期是多少时间单位？",
          "options": [
            "5",
            "10",
            "无限"
          ],
          "answer": 1,
          "explanation": "每 5 个单位翻转一次，两个翻转组成一整周期。"
        }
      }
    ],
    "exercises": [
      {
        "id": "l6-e1",
        "title": "找出锁存风险",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l6-if",
        "prompt": "always @(*) begin if(s) y=a; end 中 s=0 路径没有给 y 赋值，最直接的风险是什么？",
        "options": [
          "推导锁存器",
          "自动推导加法器",
          "y 自动归零"
        ],
        "answer": 0,
        "explanation": "过程保持旧值需要存储，组合逻辑应覆盖所有赋值路径。",
        "hints": [
          "没有赋值不等于赋值 0。"
        ]
      },
      {
        "id": "l6-e2",
        "title": "case 的结束关键字",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l6-case",
        "prompt": "填入与 case 配对的结束关键字。",
        "starter": "case(s)\n  0:y=a;\n  default:y=b;\n___",
        "solution": "endcase",
        "accepted": [
          "endcase"
        ],
        "explanation": "case/endcase 配对，begin/end 则定义语句块。",
        "hints": [
          "不是 endmodule。"
        ]
      },
      {
        "id": "l6-e3",
        "title": "重叠通配的优先级",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l6-wildcards",
        "prompt": "casex(s) 3'b0xx:y=1; 3'b01x:y=2; default:y=0; endcase，二值 s=010 时 y 是多少？",
        "options": [
          "0",
          "1",
          "2"
        ],
        "answer": 1,
        "explanation": "两个模式都匹配，但第一条匹配 0xx 优先。",
        "hints": [
          "先检查是否有重叠，再看文字顺序。"
        ]
      },
      {
        "id": "l6-e4",
        "title": "不使用 casex 的优先编码器",
        "type": "debug",
        "difficulty": 3,
        "sectionId": "l6-priority",
        "prompt": "W 四位，最高编号的 1 优先。输出 Y 为 0..3；valid 表示至少一位为 1。W=0 时规定 Y=0。",
        "starter": "module exercise (W, Y, valid);\n  input [3:0] W;\n  output [1:0] Y;\n  output valid;\n  assign Y = W[0] ? 2'd0 : W[1] ? 2'd1 : W[2] ? 2'd2 : 2'd3;\n  assign valid = W[0];\nendmodule",
        "solution": "module exercise (W, Y, valid);\n  input [3:0] W;\n  output [1:0] Y;\n  output valid;\n  assign Y = W[3] ? 2'd3 : W[2] ? 2'd2 : W[1] ? 2'd1 : 2'd0;\n  assign valid = W[3] | W[2] | W[1] | W[0];\nendmodule",
        "explanation": "从 W[3] 开始检查才能得到高位优先；valid 必须归并全部请求。",
        "hints": [
          "W=1011 应输出 3；W=1000 的 valid 应为 1。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "W",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "Y",
            "width": 2
          },
          {
            "name": "valid",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "W": 0
            },
            "expected": {
              "Y": 0,
              "valid": 0
            }
          },
          {
            "inputs": {
              "W": 1
            },
            "expected": {
              "Y": 0,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 2
            },
            "expected": {
              "Y": 1,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 3
            },
            "expected": {
              "Y": 1,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 4
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 5
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 6
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 7
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 8
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 9
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 10
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 11
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 12
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 13
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 14
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 15
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          }
        ]
      },
      {
        "id": "l6-e5",
        "title": "四位人口计数展开",
        "type": "debug",
        "difficulty": 3,
        "sectionId": "l6-for",
        "prompt": "计算 X 的 1 的总数，输出 Count 为三位。用四个逐位补零加法实现 for 位计数的等价组合功能。",
        "starter": "module exercise (X, Count);\n  input [3:0] X;\n  output [2:0] Count;\n  assign Count = X[0] ^ X[1] ^ X[2] ^ X[3];\nendmodule",
        "solution": "module exercise (X, Count);\n  input [3:0] X;\n  output [2:0] Count;\n  assign Count = {2'b00,X[0]} + {2'b00,X[1]} + {2'b00,X[2]} + {2'b00,X[3]};\nendmodule",
        "explanation": "异或只能得到奇偶性，真正计数需要加法。每个一位输入扩到三位，保留最大值 4。",
        "hints": [
          "X=1111 时不是 0，而是 4。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "X",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "Count",
            "width": 3
          }
        ],
        "vectors": [
          {
            "inputs": {
              "X": 0
            },
            "expected": {
              "Count": 0
            }
          },
          {
            "inputs": {
              "X": 1
            },
            "expected": {
              "Count": 1
            }
          },
          {
            "inputs": {
              "X": 2
            },
            "expected": {
              "Count": 1
            }
          },
          {
            "inputs": {
              "X": 3
            },
            "expected": {
              "Count": 2
            }
          },
          {
            "inputs": {
              "X": 4
            },
            "expected": {
              "Count": 1
            }
          },
          {
            "inputs": {
              "X": 5
            },
            "expected": {
              "Count": 2
            }
          },
          {
            "inputs": {
              "X": 6
            },
            "expected": {
              "Count": 2
            }
          },
          {
            "inputs": {
              "X": 7
            },
            "expected": {
              "Count": 3
            }
          },
          {
            "inputs": {
              "X": 8
            },
            "expected": {
              "Count": 1
            }
          },
          {
            "inputs": {
              "X": 9
            },
            "expected": {
              "Count": 2
            }
          },
          {
            "inputs": {
              "X": 10
            },
            "expected": {
              "Count": 2
            }
          },
          {
            "inputs": {
              "X": 11
            },
            "expected": {
              "Count": 3
            }
          },
          {
            "inputs": {
              "X": 12
            },
            "expected": {
              "Count": 2
            }
          },
          {
            "inputs": {
              "X": 13
            },
            "expected": {
              "Count": 3
            }
          },
          {
            "inputs": {
              "X": 14
            },
            "expected": {
              "Count": 3
            }
          },
          {
            "inputs": {
              "X": 15
            },
            "expected": {
              "Count": 4
            }
          }
        ]
      },
      {
        "id": "l6-e6",
        "title": "循环与时间",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l6-repeat",
        "prompt": "initial repeat(10) a=a+1; 内没有延时或事件等待，是否自动经过十个时钟周期？",
        "options": [
          "是",
          "否，次数本身不推进时钟",
          "只经过五个"
        ],
        "answer": 1,
        "explanation": "循环控制重复执行语句；时钟或仿真时间推进需要显式事件或延时。",
        "hints": [
          "区分迭代次数与时间。"
        ]
      },
      {
        "id": "l6-e7",
        "title": "补全循环更新",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l6-while",
        "prompt": "下面要依次清零 Vector[0] 到 Vector[7]。填入使索引向终止条件推进的表达式。",
        "starter": "t=0;\nwhile(t<8) begin\n  Vector[t]=0;\n  t=___;\nend",
        "solution": "t+1",
        "accepted": [
          "t+1",
          "t + 1",
          "1+t",
          "1 + t"
        ],
        "explanation": "t 每轮增加 1，访问 0..7 后到达 8，条件变假。",
        "hints": [
          "缺失更新会形成无限循环。"
        ]
      },
      {
        "id": "l6-e8",
        "title": "else-if 的组合等价式",
        "type": "code",
        "difficulty": 2,
        "sectionId": "l6-ifchain",
        "prompt": "s 是两位，s=0/1/2/3 分别输出 W[0]/W[1]/W[2]/W[3]。用连续条件表达式实现。",
        "starter": "module exercise (W, s, y);\n  input [3:0] W;\n  input [1:0] s;\n  output y;\n  assign y = W[0];\nendmodule",
        "solution": "module exercise (W, s, y);\n  input [3:0] W;\n  input [1:0] s;\n  output y;\n  assign y = (s == 2'd0) ? W[0] : (s == 2'd1) ? W[1] : (s == 2'd2) ? W[2] : W[3];\nendmodule",
        "explanation": "四个编码覆盖全部二值控制；条件链的每条分支对应一条数据线。",
        "hints": [
          "先为每个选择值单独建立一个向量。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "W",
            "width": 4
          },
          {
            "name": "s",
            "width": 2
          }
        ],
        "outputs": [
          {
            "name": "y",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "W": 0,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 0,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 0,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 0,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 1,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 1,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 1,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 1,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 2,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 2,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 2,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 2,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 4,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 4,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 4,
              "s": 2
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 4,
              "s": 3
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "s": 1
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "s": 3
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 10,
              "s": 0
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 10,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 10,
              "s": 2
            },
            "expected": {
              "y": 0
            }
          },
          {
            "inputs": {
              "W": 10,
              "s": 3
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "s": 0
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "s": 1
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "s": 2
            },
            "expected": {
              "y": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "s": 3
            },
            "expected": {
              "y": 1
            }
          }
        ]
      }
    ]
  },
  {
    "id": 7,
    "title": "组合电路与可复用计算块",
    "subtitle": "function/task、MUX、译码器、编码器与比较器",
    "sourceFile": "Lecture07.pdf",
    "sourcePages": 25,
    "available": true,
    "summary": "把前面七课的语法汇集成实际组合电路。透过 16 选 1 层级、使能译码、七段显示与优先编码，建立从规格表到代码、再到硬件连线的完整联系。",
    "objectives": [
      "区分 function 与 task 的返回机制和接口",
      "用分组选择解释 16 选 1 层级",
      "核对译码器 one-hot 位序和七段引脚约定",
      "区分普通编码与优先编码并使用有效标志",
      "构造覆盖相等、大小和边界的比较器测试"
    ],
    "sections": [
      {
        "id": "l7-function",
        "title": "7.1 function：用名称返回一个计算结果",
        "pages": "2–7",
        "body": [
          "第 5–6 页把 function 用于模块内部可重用计算。传统 Verilog 函数至少一个输入，不能声明 output 或 inout，函数名本身就是返回结果变量；不写返回类型或范围时默认一位，因此多位函数必须明确声明尺寸。",
          "函数调用像表达式：M[0]=mux4to1(W[0:3],S[1:0])。函数体内部给 mux4to1 赋值，调用处接收结果。它不是独立 module，不能用模块实例端口连接方式来调用；也不能把它当通用软件子程序随意放延时、时钟等待等时间控制。",
          "第 7 页使用同一四选一函数五次组成十六选一。代码复用提升清晰度，但综合中多个调用通常展开为相关组合逻辑，并不自动共享一份硬件在五个时钟内轮流运算。实际资源优化仍由整体表达与综合决定。"
        ],
        "code": "function mux4to1;\n  input [3:0] W;\n  input [1:0] S;\n  begin\n    case(S)\n      0: mux4to1=W[0];\n      1: mux4to1=W[1];\n      2: mux4to1=W[2];\n      3: mux4to1=W[3];\n      default: mux4to1=1'b0;\n    endcase\n  end\nendfunction",
        "hardware": "函数体表达可内联的组合计算；返回变量形成调用处的一组结果连线。",
        "pitfalls": [
          "多位函数省略返回范围，结果意外只剩一位。",
          "在函数里声明额外 output 或等待时钟。"
        ],
        "check": {
          "question": "传统 Verilog 函数通过什么返回结果？",
          "options": [
            "给函数名赋值",
            "通过任意多个 output",
            "通过模块实例名"
          ],
          "answer": 0,
          "explanation": "函数名充当返回变量，函数可以有一个多位结果，但不声明额外 output/inout。"
        }
      },
      {
        "id": "l7-task",
        "title": "7.2 task：通过方向端口传出结果",
        "pages": "8–10",
        "body": [
          "task 也用于模块内重用过程，但接口可含任意数量的 input、output、inout，且不通过 task 名称返回值。第 10 页 mux4to1(W,S,Result) 把结果写到 output Result，调用处把 M[0] 或 f 作为接收变量传入。",
          "函数可以作为表达式的一部分；任务调用本身是过程语句。y=mux_function(...) 与 mux_task(...,y) 因而不是同一种语法。比较课件第 7 与第 10 页，会发现它们构造相同选择层级，只是复用计算的接口表达不同。",
          "语言允许任务描述更丰富的过程行为，包括某些时间控制，常见于测试平台。但可综合组合任务仍要满足明确输入、完整赋值且不引入不可综合时间行为等要求；“能写成 task”不自动意味着能变成目标硬件。"
        ],
        "code": "// 任务在模块内部定义\ntask choose2;\n  input a,b,s;\n  output result;\n  begin\n    if(s) result=b;\n    else result=a;\n  end\nendtask\n// 在 always/initial 内调用：choose2(a,b,s,y);",
        "hardware": "无时间控制的组合任务可被展开成选择逻辑；调用接口通过 result 端口提供输出。",
        "pitfalls": [
          "写 y=task_name(...) 期望任务通过名字返回值。",
          "认为 task 必定共享一份硬件或必定不可综合。"
        ],
        "check": {
          "question": "关于 task 哪个说法正确？",
          "options": [
            "只能有一个 input",
            "可有多个 output，且不通过任务名返回值",
            "只能定义在 module 外部"
          ],
          "answer": 1,
          "explanation": "任务通过带方向端口传递结果，调用形式是过程语句。"
        }
      },
      {
        "id": "l7-mux",
        "title": "7.3 同一 MUX 的三种描述与完整映射",
        "pages": "11–14",
        "body": [
          "组合电路的当前输出仅依赖当前输入。第 11 页列出门、多路选择器、编码器、译码器与比较器等例子。组合不等于“没有传播时间”，而是功能上没有必须保存的历史状态；真实传播与时序约束仍需要后续分析。",
          "第 12–14 页用连续 ?:、过程 ?:、if-else 和 case 描述 MUX。它们的核心规格相同：二选一由一个选择位决定通路，四选一由两位编码选择四条数据。代码形式不同不意味着必须综合成不同功能；最终结构可能被工具优化为相同单元。",
          "验证选择器时让数据输入有区别。例如 W=0100，逐个改变 S，可以直接观察哪条路被选；所有输入都为 0 时任何选择错误都看不出来。四选一最直接的覆盖方式是每次只拉高一条数据，再扫描所有选择编码。"
        ],
        "code": "assign f = S[1] ? (S[0] ? W[3] : W[2])\n                  : (S[0] ? W[1] : W[0]);\n// S=00 -> W[0], 01 -> W[1], 10 -> W[2], 11 -> W[3]",
        "hardware": "三个二选一 MUX 可组成两层四选一；控制编码决定从哪条输入走到输出。",
        "pitfalls": [
          "选择器测试数据全相同，掩盖选择方向错误。",
          "把组合无状态误解为物理零延时。"
        ],
        "check": {
          "question": "验证四选一通路映射，哪种数据最有用？",
          "options": [
            "四路全部为 0",
            "每次只让一路为 1 并扫描 S",
            "不改变任何输入"
          ],
          "answer": 1,
          "explanation": "不同通路必须可被输出区分，one-hot 数据便于追踪。"
        }
      },
      {
        "id": "l7-hierarchy",
        "title": "7.4 十六选一层级：低位选组内，高位选组",
        "pages": "7，10，15",
        "body": [
          "第 15 页用五个四选一实例构建十六选一。第一层的四个 MUX 分别处理 W[0:3]、W[4:7]、W[8:11]、W[12:15]，共同使用低两位 S16[1:0]。第二层用高两位 S16[3:2] 在四个中间结果中选一个。",
          "把 S16 拆成“组号”和“组内号”最容易推理：S16=1011 时组号 10 选第 2 组，组内号 11 选该组第 3 个，对应 W[11]。若把两组选择位反接，输入 0011 就可能选错到另一组，且某些对称编码仍会碰巧通过。",
          "函数、任务和模块实例三种方案都展示这同一层级；区别在语言封装边界与调用方式。门图要求共享低位控制、独立中间 M[0..3]，再用高位控制最终 MUX。读到重复代码时应先画这两层结构，避免只数实例数量。"
        ],
        "code": "// 与课件升序 W[0:15] 对应的分组描述\nmux4to1 u0(W[0:3], S16[1:0], M[0]);\nmux4to1 u1(W[4:7], S16[1:0], M[1]);\nmux4to1 u2(W[8:11], S16[1:0], M[2]);\nmux4to1 u3(W[12:15], S16[1:0], M[3]);\nmux4to1 u4(M[0:3], S16[3:2], f);",
        "hardware": "第一层四个 4:1 MUX 加第二层一个 4:1 MUX；深度两级，实例数量五个。",
        "pitfalls": [
          "把高低两组选择位作用交换。",
          "把中间 M 位序接反而仅检查选择 0 和 15。"
        ],
        "check": {
          "question": "S16=4'b1011 的分组选择应指向 W 的哪一位？",
          "options": [
            "3",
            "11",
            "14"
          ],
          "answer": 1,
          "explanation": "组号 2 乘每组 4，再加组内号 3，得到 11。"
        }
      },
      {
        "id": "l7-decoder",
        "title": "7.5 使能译码与升降序位号",
        "pages": "16–18",
        "body": [
          "二到四译码器把两位编码转换为四路 one-hot：En=1 时只有编号 W 的输出有效，En=0 时所有输出为 0。课件给出拼接 {En,W} 的 case、先判断 En 的 if/case，以及逐位 for 三种写法，规格可以用同一真值表检查。",
          "第 16 页 Y 声明为 [0:3]，所以 W=0 时写 4'b1000，表示左端 Y[0]=1。网页代码练习统一用 [3:0]，相同“Y[W]=1”规格的数值表达是 4'b0001<<W。两种位串看起来相反，原因是索引方向不同，不能机械照抄常量。",
          "for 版对每个 k 都给 Y[k] 写 1 或 0，因而保证没有遗漏路径。只有 if(W==k) Y[k]=1 而没有 else 清零，会让上次选中的位残留。译码器必须保持 one-hot 或全零，而不是随着输入变化累计越来越多的 1。"
        ],
        "code": "// 本例采用降序 [3:0]；规格始终是 Y[W]=1\nmodule decoder2 (W,En,Y);\n  input [1:0] W;\n  input En;\n  output [3:0] Y;\n  assign Y = En ? (4'b0001 << W) : 4'b0000;\nendmodule",
        "hardware": "四条相等条件与使能相结合，一次激活一条输出；索引方向决定位串如何显示。",
        "pitfalls": [
          "照抄课件 [0:3] 常量到 [3:0]，导致输出编号颠倒。",
          "选中位置写 1，却忘记把其他位置清零。"
        ],
        "check": {
          "question": "采用 output [3:0] Y，W=2、En=1 时 Y 应是什么？",
          "options": [
            "0010",
            "0100",
            "1000"
          ],
          "answer": 1,
          "explanation": "编号 2 的位 Y[2] 为 1，对应降序位串 0100。"
        }
      },
      {
        "id": "l7-decoderhier",
        "title": "7.6 四到十六译码：使能是层级选择线",
        "pages": "19",
        "body": [
          "第 19 页用五个二到四译码器构建四到十六。第一层先译码 W[3:2]，生成四个分组使能 M；第二层四个译码器都接 W[1:0]，但每次只有被 M 选中的那一组可以输出 one-hot。",
          "它与十六选一 MUX 正好形成容易比较的结构：MUX 将多条数据收束为一条输出，译码器则把编码展开为一条选中线。译码器层级里传递的是使能，不是被选择的数据；把中间 M 当数据总线连错，会破坏整个分组选择。",
          "验证时不仅要查 W=0 和 15，还要跨组边界检查 3→4、7→8、11→12，确认高位分组和低位索引协同正确。En=0 时应无视地址全部输出零，这是独立于地址映射的关键接口要求。"
        ],
        "code": "// 第一层：高位产生组使能\ndec2to4 upper(W[3:2], M, En);\n// 第二层：低位在各组内译码\ndec2to4 low0(W[1:0], Y[0:3], M[0]);\ndec2to4 low1(W[1:0], Y[4:7], M[1]);\n// 其余两组同理；这里沿用课件升序 Y[0:15]",
        "hardware": "一个组选择译码器驱动四个组内译码器的使能端，总共五个二到四单元。",
        "pitfalls": [
          "第二层所有 En 都直接接全局 En，使四组同时有效。",
          "只测组内地址，没测高位跨组。"
        ],
        "check": {
          "question": "四到十六译码器的第二层四个小译码器，低两位输入相同，为何只激活一组？",
          "options": [
            "它们有不同且互斥的组使能",
            "它们按时间轮流执行",
            "它们都输出同一根线"
          ],
          "answer": 0,
          "explanation": "第一层高位译码得到 one-hot 组使能。"
        }
      },
      {
        "id": "l7-sevenseg",
        "title": "7.7 BCD 七段：逻辑表必须绑定引脚与极性",
        "pages": "20",
        "body": [
          "七段显示器的 a..g 分别控制七个发光段。第 20 页约定位序 abcdefg，1 表示亮：数字 0 是 1111110，数字 1 是 0110000，数字 8 是 1111111。七位常量必须与实际引脚顺序一致，不能只记十进制数值。",
          "BCD 只有 0..9 有效，而四位输入还有 10..15 六种编码。课件 default 写 X 用于暴露无效输入；本网页练习明确改为全灭 0000000，让 UI 可以确定地显示空白。这是练习规格的选择，不代表课件原例输出也应当为零。",
          "真实板卡可能共阳极、低电平点亮，或引脚顺序与 abcdefg 不同，必须按电路图取反或重排。先在纸上画数字需要亮哪些段，再写查找表，再逐位核对；如果所有数字都“奇怪”，优先检查极性和位序，而非立刻怀疑 BCD 输入。"
        ],
        "code": "// 本练习 leds[6:0] 对应 a,b,c,d,e,f,g，1=亮\nassign leds = (bcd==4'd0) ? 7'b1111110 :\n              (bcd==4'd1) ? 7'b0110000 :\n              (bcd==4'd8) ? 7'b1111111 : 7'b0000000;\n// 完整练习需补全 2..7 与 9；10..15 全灭",
        "hardware": "一组 BCD 到七段控制位的组合查找逻辑；板上还需要遵守限流和器件电气连接。",
        "pitfalls": [
          "将 common-anode 板卡的低有效信号直接套入高有效表。",
          "忽略 default，使无效 BCD 仍显示上一个数字。"
        ],
        "check": {
          "question": "abcdefg、1=亮的约定下，数字 0 为什么是 1111110？",
          "options": [
            "只亮 g",
            "a 到 f 亮，中心段 g 不亮",
            "七段全亮"
          ],
          "answer": 1,
          "explanation": "数字 0 由外围六段组成，中心横段关闭。"
        }
      },
      {
        "id": "l7-encoder",
        "title": "7.8 普通编码与优先编码不是同一规格",
        "pages": "21–23",
        "body": [
          "第 21 页普通八到三编码器只列出每次恰有一位为 1 的输入，例如 00000100→010。输入全零或多个 1 时，若没有额外规定就不属于有效域。case 的 default 需要冒号，投影片片段的 default Code 也应修正为 default: Code。",
          "第 22 页的优先编码器允许多位请求，并指定最高编号优先。第 23 页用从 k=0 到 3 的 for 反复覆盖 Y：遇到更高位 1，后来的赋值替换先前结果，因此最终最高位胜出。这里的优先级来自阻塞赋值覆盖顺序，和 if-else 第一条成立优先的机制不同。",
          "valid 或课件名为 z 的标志区分“没有请求”和“请求编号 0”。两者的编码位都可以是 00，但 valid 分别为 0 与 1。接口必须把这个歧义显式传给下游，否则请求 0 会被当成空闲，或空闲被当成请求 0。"
        ],
        "code": "always @(*) begin\n  Y=2'b00;\n  valid=0;\n  for(k=0;k<4;k=k+1) begin\n    if(W[k]) begin\n      Y=k;       // 较高 k 的后赋值覆盖先前值\n      valid=1;\n    end\n  end\nend",
        "hardware": "普通编码器依赖 one-hot 输入契约；优先编码器有明确仲裁顺序，并输出有效标志。",
        "pitfalls": [
          "把普通 one-hot 编码器直接用于多请求输入。",
          "把循环由升序改降序后，仍以为最高位优先不变。"
        ],
        "check": {
          "question": "上述循环改成从 k=3 递减到 0，其他赋值不变，最终谁优先？",
          "options": [
            "最高编号",
            "最低编号",
            "总是编号 3"
          ],
          "answer": 1,
          "explanation": "低编号在后面遇到时覆盖早先高编号结果，所以最低位胜出。"
        }
      },
      {
        "id": "l7-comparator",
        "title": "7.9 比较器与组合模块总复核",
        "pages": "24–25",
        "body": [
          "第 24 页四位比较器产生 AeqB、AgtB、AltB。先把三输出清零，再用 if/else-if 只置其中一个，确保每次组合计算都有完整赋值。对于确定的二值无符号输入，三种关系恰有一种为真。",
          "可以直接用三个连续比较表达式得到同样功能。数据解释仍然重要：四位 1111 作为 unsigned 是 15，作为 signed 是 -1；与 0001 比较时结论会相反。本课默认无符号端口，不能把数值显示与类型解释混淆。",
          "组合模块的统一检查法是：明确输入域、方向位宽、无效输入策略、全部赋值路径和测试区分力。MUX 查每条通路，译码器查 one-hot 与禁用，编码器查优先级与 valid，比较器查相等及大小边界。每种模块都能从代码、表格和硬件连线三个视角互证。"
        ],
        "code": "module compare4 (A,B,eq,gt,lt);\n  input [3:0] A,B;\n  output eq,gt,lt;\n  assign eq = A==B;\n  assign gt = A>B;\n  assign lt = A<B;\nendmodule",
        "hardware": "三组相关的比较逻辑产生相等、大于、小于标志；无时钟、无历史状态。",
        "pitfalls": [
          "只在成立分支置 1，忘记清除其他两个输出。",
          "无符号端口却按补码负数解释 1111。"
        ],
        "check": {
          "question": "四位无符号 A=1111、B=0001，哪项为真？",
          "options": [
            "A<B",
            "A==B",
            "A>B"
          ],
          "answer": 2,
          "explanation": "unsigned 解释为 15 和 1，因此大于标志为 1。"
        }
      }
    ],
    "exercises": [
      {
        "id": "l7-e1",
        "title": "函数如何返回",
        "type": "fill",
        "difficulty": 1,
        "sectionId": "l7-function",
        "prompt": "函数名为 choose，填入函数体中接收返回值的标识符。",
        "starter": "function choose;\n  input a,b,s;\n  begin\n    ___ = s ? b : a;\n  end\nendfunction",
        "solution": "choose",
        "accepted": [
          "choose"
        ],
        "explanation": "传统 Verilog 函数通过给自身名字赋值返回结果。",
        "hints": [
          "不是 return 关键字。"
        ]
      },
      {
        "id": "l7-e2",
        "title": "函数还是任务",
        "type": "choice",
        "difficulty": 1,
        "sectionId": "l7-task",
        "prompt": "某段可复用过程需要两个独立 output 参数，不通过自身名字返回结果，更符合哪种封装？",
        "options": [
          "传统 function",
          "task",
          "wire"
        ],
        "answer": 1,
        "explanation": "task 可有多个 input/output/inout；传统 function 通过函数名返回一个值。",
        "hints": [
          "比较第 6 页与第 8 页。"
        ]
      },
      {
        "id": "l7-e3",
        "title": "十六选一的分组",
        "type": "choice",
        "difficulty": 2,
        "sectionId": "l7-hierarchy",
        "prompt": "第一层每组四个数据，共四组。S16=1101 时，组号和组内号各是多少？",
        "options": [
          "组 1、组内 3",
          "组 3、组内 1",
          "组 3、组内 3"
        ],
        "answer": 1,
        "explanation": "高两位 11=3 是组号，低两位 01=1 是组内号，对应 W[13]。",
        "hints": [
          "把选择位切成两段。"
        ]
      },
      {
        "id": "l7-e4",
        "title": "带使能的二到四译码器",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l7-decoder",
        "prompt": "Y 声明为 [3:0]。En=1 时 Y[W]=1，其余位 0；En=0 时全部 0。注意与课件 [0:3] 显示位串不同。",
        "starter": "module exercise (W, En, Y);\n  input [1:0] W;\n  input En;\n  output [3:0] Y;\n  assign Y = 4'b0001 << W;\nendmodule",
        "solution": "module exercise (W, En, Y);\n  input [1:0] W;\n  input En;\n  output [3:0] Y;\n  assign Y = En ? (4'b0001 << W) : 4'b0000;\nendmodule",
        "explanation": "使能为零必须清除所有输出；降序范围下编号 W 对应数值 1<<W。",
        "hints": [
          "先测试 En=0,W=3。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "W",
            "width": 2
          },
          {
            "name": "En",
            "width": 1
          }
        ],
        "outputs": [
          {
            "name": "Y",
            "width": 4
          }
        ],
        "vectors": [
          {
            "inputs": {
              "W": 0,
              "En": 0
            },
            "expected": {
              "Y": 0
            }
          },
          {
            "inputs": {
              "W": 1,
              "En": 0
            },
            "expected": {
              "Y": 0
            }
          },
          {
            "inputs": {
              "W": 2,
              "En": 0
            },
            "expected": {
              "Y": 0
            }
          },
          {
            "inputs": {
              "W": 3,
              "En": 0
            },
            "expected": {
              "Y": 0
            }
          },
          {
            "inputs": {
              "W": 0,
              "En": 1
            },
            "expected": {
              "Y": 1
            }
          },
          {
            "inputs": {
              "W": 1,
              "En": 1
            },
            "expected": {
              "Y": 2
            }
          },
          {
            "inputs": {
              "W": 2,
              "En": 1
            },
            "expected": {
              "Y": 4
            }
          },
          {
            "inputs": {
              "W": 3,
              "En": 1
            },
            "expected": {
              "Y": 8
            }
          }
        ]
      },
      {
        "id": "l7-e5",
        "title": "BCD 七段译码完整查表",
        "type": "code",
        "difficulty": 3,
        "sectionId": "l7-sevenseg",
        "prompt": "leds[6:0] 对应 abcdefg，1 表示点亮。实现数字 0..9；BCD=10..15 全灭。按正文七段表补全组合条件链。",
        "starter": "module exercise (bcd, leds);\n  input [3:0] bcd;\n  output [6:0] leds;\n  assign leds = (bcd == 4'd0) ? 7'b1111110 : 7'b0000000;\nendmodule",
        "solution": "module exercise (bcd, leds);\n  input [3:0] bcd;\n  output [6:0] leds;\n  assign leds = (bcd == 4'd0) ? 7'b1111110 : (bcd == 4'd1) ? 7'b0110000 : (bcd == 4'd2) ? 7'b1101101 : (bcd == 4'd3) ? 7'b1111001 : (bcd == 4'd4) ? 7'b0110011 : (bcd == 4'd5) ? 7'b1011011 : (bcd == 4'd6) ? 7'b1011111 : (bcd == 4'd7) ? 7'b1110000 : (bcd == 4'd8) ? 7'b1111111 : (bcd == 4'd9) ? 7'b1111011 : 7'b0000000;\nendmodule",
        "explanation": "每个常量要按 abcdefg 逐段核对；本练习无效输入定义为全灭，与课件 default X 策略不同。",
        "hints": [
          "1 只亮 b、c：0110000。",
          "8 亮全部：1111111。",
          "先完善 0..9，再处理无效域。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "bcd",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "leds",
            "width": 7
          }
        ],
        "vectors": [
          {
            "inputs": {
              "bcd": 0
            },
            "expected": {
              "leds": 126
            }
          },
          {
            "inputs": {
              "bcd": 1
            },
            "expected": {
              "leds": 48
            }
          },
          {
            "inputs": {
              "bcd": 2
            },
            "expected": {
              "leds": 109
            }
          },
          {
            "inputs": {
              "bcd": 3
            },
            "expected": {
              "leds": 121
            }
          },
          {
            "inputs": {
              "bcd": 4
            },
            "expected": {
              "leds": 51
            }
          },
          {
            "inputs": {
              "bcd": 5
            },
            "expected": {
              "leds": 91
            }
          },
          {
            "inputs": {
              "bcd": 6
            },
            "expected": {
              "leds": 95
            }
          },
          {
            "inputs": {
              "bcd": 7
            },
            "expected": {
              "leds": 112
            }
          },
          {
            "inputs": {
              "bcd": 8
            },
            "expected": {
              "leds": 127
            }
          },
          {
            "inputs": {
              "bcd": 9
            },
            "expected": {
              "leds": 123
            }
          },
          {
            "inputs": {
              "bcd": 10
            },
            "expected": {
              "leds": 0
            }
          },
          {
            "inputs": {
              "bcd": 11
            },
            "expected": {
              "leds": 0
            }
          },
          {
            "inputs": {
              "bcd": 12
            },
            "expected": {
              "leds": 0
            }
          },
          {
            "inputs": {
              "bcd": 13
            },
            "expected": {
              "leds": 0
            }
          },
          {
            "inputs": {
              "bcd": 14
            },
            "expected": {
              "leds": 0
            }
          },
          {
            "inputs": {
              "bcd": 15
            },
            "expected": {
              "leds": 0
            }
          }
        ]
      },
      {
        "id": "l7-e6",
        "title": "高位优先编码与有效位",
        "type": "debug",
        "difficulty": 3,
        "sectionId": "l7-encoder",
        "prompt": "W 多个 1 时选最大编号。Y 输出该编号；valid 表示非零。W=0 时 Y=0，valid=0。修复低位优先的错误。",
        "starter": "module exercise (W, Y, valid);\n  input [3:0] W;\n  output [1:0] Y;\n  output valid;\n  assign Y = W[0] ? 2'd0 : W[1] ? 2'd1 : W[2] ? 2'd2 : 2'd3;\n  assign valid = W != 4'b0000;\nendmodule",
        "solution": "module exercise (W, Y, valid);\n  input [3:0] W;\n  output [1:0] Y;\n  output valid;\n  assign Y = W[3] ? 2'd3 : W[2] ? 2'd2 : W[1] ? 2'd1 : 2'd0;\n  assign valid = W != 4'b0000;\nendmodule",
        "explanation": "从高位开始的条件链给最高请求优先权；全零编码需显式设为 0，不能留下 3。",
        "hints": [
          "W=1011 应得到 3；W=0000 应得到 Y=0,valid=0。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "W",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "Y",
            "width": 2
          },
          {
            "name": "valid",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "W": 0
            },
            "expected": {
              "Y": 0,
              "valid": 0
            }
          },
          {
            "inputs": {
              "W": 1
            },
            "expected": {
              "Y": 0,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 2
            },
            "expected": {
              "Y": 1,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 3
            },
            "expected": {
              "Y": 1,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 4
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 5
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 6
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 7
            },
            "expected": {
              "Y": 2,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 8
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 9
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 10
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 11
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 12
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 13
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 14
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          },
          {
            "inputs": {
              "W": 15
            },
            "expected": {
              "Y": 3,
              "valid": 1
            }
          }
        ]
      },
      {
        "id": "l7-e7",
        "title": "三标志无符号比较器",
        "type": "code",
        "difficulty": 2,
        "sectionId": "l7-comparator",
        "prompt": "A、B 均四位无符号。eq=(A==B)，gt=(A>B)，lt=(A<B)，三个输出一位。",
        "starter": "module exercise (A, B, eq, gt, lt);\n  input [3:0] A;\n  input [3:0] B;\n  output eq;\n  output gt;\n  output lt;\n  assign eq = 1'b0;\n  assign gt = 1'b0;\n  assign lt = 1'b0;\nendmodule",
        "solution": "module exercise (A, B, eq, gt, lt);\n  input [3:0] A;\n  input [3:0] B;\n  output eq;\n  output gt;\n  output lt;\n  assign eq = A == B;\n  assign gt = A > B;\n  assign lt = A < B;\nendmodule",
        "explanation": "确定二值输入下三个关系恰有一个成立。边界 7/8、0/15 能查出误用符号或位序问题。",
        "hints": [
          "本题 1111 是 15。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "A",
            "width": 4
          },
          {
            "name": "B",
            "width": 4
          }
        ],
        "outputs": [
          {
            "name": "eq",
            "width": 1
          },
          {
            "name": "gt",
            "width": 1
          },
          {
            "name": "lt",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "A": 0,
              "B": 0
            },
            "expected": {
              "eq": 1,
              "gt": 0,
              "lt": 0
            }
          },
          {
            "inputs": {
              "A": 1,
              "B": 1
            },
            "expected": {
              "eq": 1,
              "gt": 0,
              "lt": 0
            }
          },
          {
            "inputs": {
              "A": 0,
              "B": 15
            },
            "expected": {
              "eq": 0,
              "gt": 0,
              "lt": 1
            }
          },
          {
            "inputs": {
              "A": 15,
              "B": 0
            },
            "expected": {
              "eq": 0,
              "gt": 1,
              "lt": 0
            }
          },
          {
            "inputs": {
              "A": 7,
              "B": 8
            },
            "expected": {
              "eq": 0,
              "gt": 0,
              "lt": 1
            }
          },
          {
            "inputs": {
              "A": 8,
              "B": 7
            },
            "expected": {
              "eq": 0,
              "gt": 1,
              "lt": 0
            }
          },
          {
            "inputs": {
              "A": 15,
              "B": 15
            },
            "expected": {
              "eq": 1,
              "gt": 0,
              "lt": 0
            }
          },
          {
            "inputs": {
              "A": 1,
              "B": 2
            },
            "expected": {
              "eq": 0,
              "gt": 0,
              "lt": 1
            }
          },
          {
            "inputs": {
              "A": 14,
              "B": 15
            },
            "expected": {
              "eq": 0,
              "gt": 0,
              "lt": 1
            }
          }
        ]
      },
      {
        "id": "l7-e8",
        "title": "四选一路由完整覆盖",
        "type": "debug",
        "difficulty": 2,
        "sectionId": "l7-mux",
        "prompt": "W[3:0] 为四条数据，S 为选择编码。令 f=W[S]，仅使用固定 bit select 与嵌套 ?:，不能写 always。",
        "starter": "module exercise (W, S, f);\n  input [3:0] W;\n  input [1:0] S;\n  output f;\n  assign f = S[0] ? W[1] : W[0];\nendmodule",
        "solution": "module exercise (W, S, f);\n  input [3:0] W;\n  input [1:0] S;\n  output f;\n  assign f = S[1] ? (S[0] ? W[3] : W[2]) : (S[0] ? W[1] : W[0]);\nendmodule",
        "explanation": "原代码忽略 S[1]，只能选择低两路；加入高位选择后才能覆盖全部四路。",
        "hints": [
          "W=0100,S=10 能直接暴露遗漏的高组。"
        ],
        "engine": "comb",
        "inputs": [
          {
            "name": "W",
            "width": 4
          },
          {
            "name": "S",
            "width": 2
          }
        ],
        "outputs": [
          {
            "name": "f",
            "width": 1
          }
        ],
        "vectors": [
          {
            "inputs": {
              "W": 0,
              "S": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 0,
              "S": 1
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 0,
              "S": 2
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 0,
              "S": 3
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 1,
              "S": 0
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 1,
              "S": 1
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 1,
              "S": 2
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 1,
              "S": 3
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 2,
              "S": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 2,
              "S": 1
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 2,
              "S": 2
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 2,
              "S": 3
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 4,
              "S": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 4,
              "S": 1
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 4,
              "S": 2
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 4,
              "S": 3
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "S": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "S": 1
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "S": 2
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 8,
              "S": 3
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 5,
              "S": 0
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 5,
              "S": 1
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 5,
              "S": 2
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 5,
              "S": 3
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 10,
              "S": 0
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 10,
              "S": 1
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 10,
              "S": 2
            },
            "expected": {
              "f": 0
            }
          },
          {
            "inputs": {
              "W": 10,
              "S": 3
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "S": 0
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "S": 1
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "S": 2
            },
            "expected": {
              "f": 1
            }
          },
          {
            "inputs": {
              "W": 15,
              "S": 3
            },
            "expected": {
              "f": 1
            }
          }
        ]
      }
    ]
  }
];
