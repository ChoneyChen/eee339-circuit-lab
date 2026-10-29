# Circuit Lab · XJTLU EEE339 · 2026–2027

适配西交利物浦大学（XJTLU）**2026–2027 学年（26–27）EEE339** 课程的个人 Verilog 跟练网站。围绕代码串联简短讲解与练习，每讲内部按题目翻页；中文辅助理解，重点术语附英文，以便衔接全英文教学。

| 课程信息 | 内容 |
| --- | --- |
| 学校 | 西交利物浦大学 · Xi’an Jiaotong-Liverpool University（XJTLU） |
| 课程代码 | EEE339 |
| 课程名称 | Digital System Design with HDL |
| 学年 | 2026–2027（26–27） |
| 学分与学期 | 5 学分 · 第一学期（SEM1） |
| 授课语言 | 英语（English）；本站提供中文辅助讲解与英文重点术语 |

课程围绕 Verilog 逻辑电路与处理器设计，涵盖分层设计（hierarchical design）、体系结构与性能分析，以及仿真（simulation）、综合（synthesis）和验证（verification）。

本站是个人学习辅助项目，并非 XJTLU 官方课程网站。课程安排与考核要求以学校和授课教师发布的信息为准。

内容基于 12 份 EEE339 原课件、313 页教学材料整理；第 1–9、11–15 讲已整理，第 10 讲等待原课件补充。合并的 12–13、14–15 讲按内容主题划分学习单元，保留原 PDF 页码；后续可继续增补或更新。

**在线访问：[Circuit Lab](https://choneychen.github.io/eee339-circuit-lab/) · 代码与学习资源：[GitHub 仓库](https://github.com/ChoneyChen/eee339-circuit-lab)**

如果觉得好，给作者一个 Star 标星，以示鼓励吧！

目前包含 **110 个知识小节、110 道随手检验、119 道练习，共 229 个题目分页**；40 道可运行组合代码题的参考答案已通过全部 858 组课程向量。

## 当前学习流程

每讲内部按“**一道题一页**”组织：当前页先展示该题对应的 Verilog 代码、2–4 条关键代码行简讲和硬件含义，再完成本页唯一一道随手检验或练习题。同一知识小节的多道题分开翻页，各页保留对应代码和讲解。

可使用上一题、下一题或直接跳页自由浏览；再次进入课程可继续上次的题目页。草稿和作答记录随本地学习状态保存，翻页不会清空已保存的输入。原有知识小节链接仍可定位到该节对应的题目页。

选择、填空、编程和纠错题的反馈、反例与电路图在当前页显示，不需要跳到独立题库。原始详细正文保留在课程数据中供来源核对与搜索。

重点术语自动附英文，例如连续赋值（continuous assignment）、位宽（bit width）、有限状态机（finite-state machine）。术语库含 120 项，保护代码片段并避免重复标注，支持英文术语检索。

## 功能

- 代码优先：带行号的 Verilog、对应行的中英术语简讲、输入变化实验与就地练习。
- 讲内题目分页：每页一道题，支持上一题、下一题、直接跳页与继续上次学习位置。
- 单选、代码填空、代码构建与纠错；每题关联所属知识点。
- 组合逻辑代码真实解析执行，给出行号诊断、反例、期望/实际输出、表达式连接图和采样波形。
- 逻辑门、MUX、加法器、比较器交互实验；DFF、计数器、移位寄存器、101 状态机固定时序模型。
- 总线交换单步模型、CPU 时间和 Amdahl 定律交互实验。
- 全文搜索、笔记、收藏、错题、阅读进度、代码草稿自动保存；JSON 导出/导入。
- 自适应桌面/手机界面，键盘搜索与代码运行快捷键。
- 本地 PDF 对照：用户连接文件后，课件页码可打开原 PDF。原课件与提取全文不随网站发布。

## 本地运行

无需安装前端依赖；Node 20+ 用于测试，Python 3 用于本地预览。

```sh
npm run dev
# 打开 http://127.0.0.1:4173
npm test
npm run check
```

所有静态资源使用相对路径，适用于 GitHub Pages 项目子路径。`.nojekyll` 保证按静态文件发布；从仓库 `main` 分支根目录托管。

## 内容与代码

| 目录 | 用途 |
| --- | --- |
| `js/app.js` | 路由、代码跟练课程、笔记与本地学习状态 |
| `js/lesson-pagination.js` | 按稳定题目 ID 生成讲内分页、解析旧链接与恢复位置 |
| `js/lesson-reader.js` | 每页代码讲解与一道题、上下题导航和题目目录 |
| `js/exercise-player.js` | 课程内与题库复用的练习组件，反馈留在原处 |
| `js/lesson-code.js` | Verilog 行号、语法高亮与精确行定位 |
| `js/terminology.js` | 120 个中英术语与保护代码的标注函数 |
| `js/lessons-early.js` | 第 1–7 讲的知识点与练习 |
| `js/lessons-late.js` | 第 8–15 讲与第 10 讲缺课占位 |
| `js/lessons-custom.js` | 后续新增或同 ID 替换课程的更新入口 |
| `js/simulator.js` | 有限组合 Verilog 子集解析器与执行器 |
| `js/labs.js`、`js/system-labs.js` | 电路、时序、总线和性能交互实验 |
| `content/audit-*.md` | 原课件逐页阅读覆盖说明 |
| `content/UPDATE_GUIDE.md` | 增补课件、知识点与习题的具体方法 |
| `tests/`、`scripts/check-content.mjs` | 引擎测试与所有课程参考答案校验 |

## 范围与正确性

这是教学前端。组合解释器支持单模块、无符号、二态连续赋值，不是完整 Verilog 编译器，不替代 Icarus Verilog、Vivado 或器件级时序分析。不能运行的语法会返回明确的中文诊断；代码题比较真实输出，不按答案文本相似度评分。通过所列向量不等同形式验证。表达式图从当前代码生成，不声称是 FPGA 实际综合资源或门级布局。

时序/FSM/总线实验执行旁边展示的固定行为模型；代码为只读并标注范围。CPU 性能实验执行数学模型。学习记录只保存在浏览器 localStorage；清理浏览器、无痕会话或换设备可能丢失，建议定期导出。

原课件来自 EEE339（Dr. Ming Xu、Dr. Kain Lu Low）。中文材料与练习为依据原课件独立整理；原文件不公开上传。课程内澄清部分原件笔误与过度简化表述。

## 参考的公开教学设计

- [HDLBits](https://hdlbits.01xz.net/wiki/Main_Page)：小电路练习与向量反馈方法。
- [MIT 6.004 Computation Structures](https://computationstructures.org/)：从电路到系统的知识递进。
- [Nand2Tetris Project 1](https://www.nand2tetris.org/project01)：逐层搭建硬件与测试契约。
- [Icarus Verilog](https://steveicarus.github.io/iverilog/)：完整 HDL 仿真工具的后续路线。

本站不隶属上述课程，不复制其题库与解答。
