/**
 * special-event.js - 特殊事件管理
 * 
 * 文件概述：
 * 定义和管理特殊事件，在跳过一周或选择"特殊剧情"选项时检查条件并触发符合条件的事件。
 * 支持复杂的条件检查、变量修改、预设文本发送和事件链触发。
 * 
 * 主要功能：
 * 1. 定义特殊事件数据结构（支持事件链）
 * 2. 检查事件触发条件（支持嵌套变量路径）
 * 3. 应用事件效果（修改游戏变量，支持set/add/push操作）
 * 4. 发送预设的事件文本（SLG_MODE格式）
 * 5. 防止事件重复触发
 * 6. 支持通过currentSpecialEvent实现事件链
 * 
 * 对外暴露的主要函数：
 * - checkSpecialEvents(): 检查是否有符合条件的特殊事件（按优先级排序）
 * - triggerSpecialEvent(event, options): 触发指定的特殊事件
 * - getTriggeredEvents(): 获取已触发的事件ID列表
 * - resetEventTrigger(eventId): 重置指定事件的触发状态
 * 
 * 内部函数：
 * - getValueByPath(path): 根据路径获取变量值（支持嵌套如"npcFavorability.C"）
 * - setValueByPath(path, newValue): 根据路径设置变量值
 * - checkCondition(value, condition, path): 检查单个条件是否满足
 * - checkEventConditions(event): 检查事件的所有条件
 * - applyEventEffects(event): 应用事件效果
 * - markEventTriggered(eventId): 标记事件已触发
 * 
 * 事件数据结构说明：
 * - id: 唯一标识符（用于防重复和事件链）
 * - name: 事件名称（调试用）
 * - priority: 优先级（数字越大越优先）
 * - conditions: 触发条件对象（支持min/max/equals/in检查）
 * - effects: 效果对象（支持set/add/push操作）
 * - text: 预设文本（SLG_MODE格式）
 * 
 * 依赖关系：
 * - 依赖 game-state.js 中的状态变量
 * - 依赖 game-utils.js 中的渲染环境检测函数
 * - 依赖 game-events.js 中的parseLLMResponse函数
 */

// ==================== 特殊事件定义 ====================
/**
 * 事件数据结构说明：
 * {
 *   id: string,           // 唯一标识符，用于防止重复触发
 *   name: string,         // 事件名称（调试用）
 *   priority: number,     // 优先级，数字越大越优先检查
 *   conditions: {         // 触发条件，全部满足才触发
 *     variablePath: {     // 变量路径，支持嵌套如 "npcFavorability.C"
 *       min: number,      // 最小值（可选）
 *       max: number,      // 最大值（可选）
 *       equals: any,      // 精确匹配（可选）
 *       in: array         // 值在数组中（可选）
 *     }
 *   },
 *   effects: {            // 触发后的变量修改
 *     variablePath: value | { add: number } | { set: value }
 *   },
 *   text: string          // 要发送的预设文本（SLG_MODE格式）
 * }
 */

const specialEvents = [
    {
        id: "Apprenticeship_Storyline_1",
        name: "Bái Sư Lệnh Tuyết Phi 1",
        priority: 100,
        conditions: {
            currentWeek: { min: 4 }  // 第4周（第一个月末）
        },
        effects: {
            GameMode: { set: 1 },
            inputEnable: { set: 0 },
            mapLocation: { set: 'Thiên Sơn Phái Ngoại Bảo' },
            companionNPC: { push: 'Linh Tuyết Phi' }
        },
        text: `<SLG_MODE>

<MAIN_TEXT>
Một tuần mới bắt đầu, một ngày nọ, trên quan lộ, ánh nắng có chút chói mắt. Ngươi cưỡi trên lưng ngựa, cảm thấy mông mình sắp bị xóc thành tám mảnh rồi —— con ngựa tồi tệ này, chạy lên cứ như bị động kinh, bốn chân mỗi chân đi một nẻo, cứ như giữa chúng có thâm thù đại hận gì vậy. Đồng hành cùng ngươi là bốn đệ tử ngoại môn mới nhập môn không lâu, mọi người đều mặc kình trang tiện phục, bên hông đeo trường kiếm, trông cũng có vài phần dáng vẻ của người trong giang hồ.|none|Sa mạc|none|none

Thiếu niên tên A Phúc ở bên trái ngươi khẽ hỏi: "Sư huynh, nơi chúng ta hẹn gặp đoàn xe có phải là dịch trạm phía trước không?" Hắn chỉ tay về phía tòa dịch trạm đổ nát ở đằng xa. Ngươi gật đầu đáp lại, lần xuống núi này, các ngươi nhận lệnh đi đón đoàn xe thu mua lương thực, lẽ ra đây chỉ là một việc thường ngày không thể bình thường hơn, nhưng không hiểu sao từ nãy đến giờ trong lòng ngươi cứ bồn chồn bất an —— giống như hồi nhỏ lén ăn vụng đồ cúng trên bàn thờ, luôn cảm thấy giây tiếp theo sẽ bị báo ứng. Nhưng ngươi không nói gì, chỉ theo bản năng siết chặt chuôi kiếm.|none|Sa mạc|none|none

Rất nhanh sau đó các ngươi thúc ngựa đến dịch trạm. Những bức tường đất đổ nát, cổng lầu sụp đổ, xung quanh là những bãi cỏ hoang tàn khô héo, gió thổi qua cuốn theo những hạt cát vụn, đập vào mặt đau rát. Xung quanh quá yên tĩnh, trên quan lộ không một bóng người, trong dịch trạm cũng không có chút động tĩnh nào. Theo lý mà nói, đoàn xe lẽ ra phải đến từ lâu rồi mới đúng. Ngươi phát hiện trên quan lộ trước cửa dịch trạm có vết bánh xe, nhìn độ sâu thì chắc chưa quá nửa ngày, nhưng đoàn xe lại không thấy tăm hơi... Tim ngươi chợt đập nhanh liên hồi: "Không đúng, ở đây có vấn đề ——"|none|Phế tích|none|none

Bộp! Một tiếng động trầm đục vang lên, A Phúc đột nhiên ngã nhào khỏi ngựa, trước ngực cắm một mũi tên nặng vẫn còn đang rung bần bật. Tiếng hét của ngươi còn chưa kịp thốt ra, tiếng xé gió đã vang lên từ bốn phương tám hướng, mưa tên dày đặc như bầy châu chấu xé không lao đến. Ngươi theo bản năng nghiêng người, một mũi tên sượt qua vai ngươi, kéo rách một mảnh vải. Phía sau truyền đến tiếng kêu thảm —— ngươi quay đầu nhìn lại, một danh sư huynh cùng ngựa đổ rầm xuống đất, ba mũi tên đồng thời bắn trúng hắn, vào vai, đùi, và một mũi cắm thẳng vào lưng ngựa.|none|Sa mạc|none|none

"Chết tiệt!" Ngươi mạnh mẽ quay đầu ngựa, "Chạy mau! Quay lại ——" Lời còn chưa dứt, từ sau những đống cát hai bên quan lộ vọt ra một đội kỵ binh vũ trang đầy đủ. Chiến giáp màu đen, áo choàng đỏ tươi, tay cầm loan đao và cường cung —— là Cầm Sinh Quân của Tây Hạ! Ít nhất có ba mươi kỵ! Viên sĩ quan cầm đầu mang nụ cười dữ tợn trên mặt, dùng tiếng Hán ngọng nghịu hét lớn: "Lũ nhóc Thiên Sơn phái! Hôm nay đứa nào cũng đừng hòng chạy thoát!" Não bộ ngươi xoay chuyển tức thì: Đoàn xe e là đã bị tiêu diệt toàn bộ, địch quân đã mai phục từ lâu —— tình báo bị rò rỉ rồi! Đây là một cái bẫy! "Chạy đi!" Ngươi gầm lên, "Tản ra mà chạy! Về môn phái cầu cứu!"|none|Sa mạc|none|none

Tiếng vó ngựa truy đuổi vang vang sau lưng như sấm dậy. Ngươi liều mạng quất dây cương, chỉ hận không thể mọc thêm bốn cái chân. Dư quang liếc thấy toán Cầm Sinh Quân phía sau thuần thục giương cung cài tên ngay trên lưng ngựa, tiếng xé gió lại vang lên! Ngươi theo bản năng cúi người, một mũi tên sượt qua đỉnh đầu, bắn đứt vài sợi tóc. Tim đập loạn nhịp trong lồng ngực, cổ họng khô khốc, mồ hôi lạnh chảy ròng ròng dọc sống lưng. Sư đệ ở phía sau bên trái ngươi kêu thảm một tiếng, bị một mũi tên bắn trúng lưng, ngã nhào khỏi ngựa. Giờ chỉ còn lại ngươi và một thiếu niên tên Cẩu Oa.|none|Sa mạc|none|none

"Đừng quay đầu lại!" Ngươi hét lớn, "Chạy đi! Báo cho môn phái biết! Cầm Sinh Quân đã nắm rõ lộ trình vận chuyển lương thực của chúng ta rồi!" Các ngươi liều mạng thúc ngựa cuồng chạy, truy binh phía sau ngày càng gần, ngươi có thể nghe thấy tiếng hò hét của chúng, nghe thấy tiếng dây cung bị kéo căng. Cách ngoại bảo còn hơn hai mươi dặm, ngươi không biết mình có thể chạy về được không, nhưng ngươi phải chạy —— ít nhất phải có một người còn sống trở về để truyền tin! Ngựa của Cẩu Oa đột nhiên loạng choạng, suýt chút nữa ngã quỵ. Ngươi nhìn thoáng qua, trên chân ngựa của hắn có cắm một mũi tên. "Sư huynh! Ngựa của đệ bị thương rồi!" Giọng Cẩu Oa mang theo tiếng khóc.|none|Sa mạc|none|none

Ngươi cắn răng, chưa kịp nói gì thì lại nghe thấy phía sau một tiếng động trầm đục —— Cẩu Oa ngã nhào khỏi ngựa, sau gáy cắm một mũi tên. Con ngựa của hắn hí lên kinh hãi, lao ra được vài bước rồi đổ rầm xuống đất. Ngươi nghiến chặt răng, liều mạng quất roi vào ngựa, con ngựa tồi tệ vì đau mà phát ra tiếng hí thê lương, bốn vó bay loạn. Nước mắt làm mờ tầm mắt, ngươi dùng tay áo lau vội, những sư huynh đệ cùng xuống núi đều đã chết hết, chỉ còn lại mình ngươi. "Chết tiệt! Chết tiệt! Chết tiệt!" Ngươi vừa chạy vừa mắng, không biết là đang mắng kẻ thù, hay đang mắng sự vô dụng của chính bản thân mình.|none|Sa mạc|none|none

Điều kỳ lạ là mưa tên phía sau đột nhiên ngừng hẳn. Ngươi ngẩn người, theo bản năng quay đầu nhìn lại —— đội Cầm Sinh Quân đó vẫn bám đuổi gắt gao, nhưng quả thực không tiếp tục bắn tên nữa, chúng giữ khoảng cách chừng bảy mươi bước, chậm rãi điềm nhiên đi theo sau ngươi. Trong lòng ngươi nghi hoặc: "Tại sao không bắn? Lẽ nào hết tên rồi? Không đúng, lúc nãy chúng bắn nhiều tên như vậy, chắc chắn vẫn còn hàng dự trữ. Vậy thì tại sao..." Địa hình phía trước ngươi rất quen thuộc —— còn mười dặm nữa là đến lối vào hẻm núi dẫn tới môn phái! Chỉ cần lao vào hẻm núi, đi xuyên qua con đường hẹp đó là có thể đến được ngoại bảo của Thiên Sơn phái! Hy vọng ngay trước mắt!|none|Sơn cốc|none|none

Tim ngươi đập nhanh hơn nữa, con ngựa tồi tệ dường như cũng cảm nhận được, dốc hết sức lực cuối cùng cuồng chạy. Gió rít gào bên tai, ngươi có thể thấy hình bóng vách đá quen thuộc đằng xa —— nơi đó chính là con đường về nhà! Trong đầu ngươi chợt lóe lên một ý nghĩ: "Nhưng mà... tại sao quân truy đuổi vẫn không bắn tên?" Một ý nghĩ nổ tung trong tâm trí —— chúng đang theo dõi ngươi! Chúng muốn để ngươi sống sót trở về, muốn ngươi dẫn chúng đến lối vào bí mật của Thiên Sơn phái! Lòng ngươi chợt lạnh toát. Cầm Sinh Quân Tây Hạ luôn tìm kiếm nơi tọa lạc của Thiên Sơn phái, nhưng lối vào hẻm núi được giấu cực kỳ kín đáo, người ngoài căn bản không tìm được. Mà ngươi lúc này giống như một con thỏ hoảng loạn, đang dẫn bầy sói về ổ của mình. Trong ngoại bảo còn có mấy ngàn nạn dân —— người già, trẻ nhỏ, phụ nữ —— đều là những bách tính vô tội được Thiên Sơn phái cứu giúp những năm qua, nếu người Tây Hạ tìm thấy lối vào, nếu chúng mang tin này về doanh trại Cầm Sinh Quân... Ngươi không dám nghĩ tiếp nữa.|none|Sơn cốc|none|none
</MAIN_TEXT>

<SUMMARY>
Ngươi cùng bốn vị sư huynh đệ ngoại môn nhận lệnh đến dịch trạm đón đoàn xe lương thực, dọc đường lòng linh cảm bất an. Đến nơi phát hiện dịch trạm trống không, đoàn xe mất tích. Đột nhiên bị Cầm Sinh Quân Tây Hạ phục kích, A Phúc, Cẩu Oa và các sư huynh đệ lần lượt trúng tên tử vong, chỉ còn mình ngươi liều chết thoát thân. Quân truy đuổi đột nhiên ngừng bắn tên, giữ khoảng cách theo dõi. Ngươi bừng tỉnh đại ngộ —— kẻ thù muốn lợi dụng ngươi để tìm ra lối vào hẻm núi bí mật của Thiên Sơn phái, trong ngoại bảo còn hơn ngàn nạn dân vô tội, ngươi rơi vào tình thế tiến thoái lưỡng nan.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Cầm Sinh Quân Tây Hạ bám đuổi gắt gao, ngươi nhận ra chúng muốn lợi dụng ngươi để tìm lối vào Thiên Sơn phái. Tiếp tục chạy về hẻm núi sẽ làm lộ vị trí môn phái, dừng lại thì chắc chắn sẽ chết.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "10:30",
    "Người chơi": {
        "Thay đổi vị trí": "Sơn đạo"
    },
    "NPC hiện tại": {}
}
</SIDE_NOTE>

</SLG_MODE>`
    },
    {
        id: "Apprenticeship_Storyline_2",
        name: "Bái Sư Lệnh Tuyết Phi 2",
        priority: 99,
        conditions: {
            currentSpecialEvent: { equals: 'Apprenticeship_Storyline_1' }
        },
        effects: {},  // Vô thuộc tính biến hóa
        text: `<SLG_MODE>

<MAIN_TEXT>
Ngươi ép mình hít một hơi thật sâu, cố ý cho ngựa chạy chậm lại, con ngựa tồi tệ này vốn cũng đã mệt đến thở không ra hơi, vừa thấy ngươi siết chặt dây cương là lập tức chậm lại ngay. Tiếng vó ngựa phía sau cũng chậm lại theo. Lòng ngươi chùng xuống —— quả nhiên! Chúng đang bám đuôi ngươi! "Lũ tạp chủng chết tiệt..." Ngươi thấp giọng rủa thầm, lòng bàn tay ướt đẫm mồ hôi lạnh. Ngươi hít sâu một hơi, tim đập loạn xạ. "Con xin lỗi... cha mẹ..." Phía trước xuất hiện một ngã ba đường —— bên trái dẫn đến hẻm núi, bên phải là một vùng rừng núi hẻo lánh ít người qua lại, bên trong đầy rẫy dã thú và độc trùng, ngay cả thợ săn cũng không muốn vào, theo lời kể của tiên sinh kể chuyện ở ngoại bảo, sâu trong rừng này còn có ác quỷ trú ngụ, ai vào đó đều sẽ mất tích. Ngươi mạnh mẽ giật dây cương, con ngựa tồi tệ hí vang rồi ngoặt sang bên phải, lao vào khu rừng rậm rạp.|none|Sơn đạo|none|none

"Hử? Thằng nhóc đó chạy sang bên phải rồi!" Phía sau truyền đến tiếng hét của Cầm Sinh Quân, "Đuổi theo! Đừng để nó chạy thoát!" Ngươi nghiến răng, liều mạng lao sâu vào trong rừng. Cành cây cào rách quần áo, rạch xước cả má, ngươi căn bản không màng tới. Con ngựa tồi tệ chạy lảo đảo trong rừng, mấy lần suýt ngã quỵ. Mười dặm, mười một dặm, mười hai dặm... Ngươi không biết mình đã chạy bao lâu, chỉ biết trời đã dần tối, ánh sáng trong rừng ngày càng mờ mịt. Tiếng thở của con ngựa như tiếng ống búa, bốn chân run rẩy. "Cố gắng chút nữa thôi... cố gắng chút nữa thôi..." Ngươi nhẹ nhàng vỗ vỗ cổ ngựa để khích lệ nó, cũng giống như đang lẩm bẩm tự nhủ với bản thân.|none|Rừng cây|none|none

Đột nhiên —— Rắc! Chân trước của ngựa vấp phải một rễ cây nằm ngang trên mặt đất, cả con ngựa lao đầu xuống! Ngươi bị hất văng ra, lăn lộn mấy vòng trên đất, lưng đập mạnh vào một thân cây, đau đến mức trước mắt tối sầm lại. Con ngựa tồi tệ nằm trên đất co giật, phát ra tiếng hí thê lương. Tiếng vó ngựa phía sau ngày càng gần. Toàn thân ngươi đau nhức, xương sườn có lẽ đã gãy mất mấy cái, cánh tay trái cũng không cử động được nữa, trong miệng đầy mùi máu tanh. Nhưng ngươi vẫn lảo đảo đứng dậy. Tay ngươi chạm vào chuôi kiếm bên hông —— đó là thanh trường kiếm tiêu chuẩn được phát khi mới nhập môn, ngươi còn chưa học hết kiếm pháp, bình thường nhiều nhất chỉ dùng để chẻ củi, thỉnh thoảng còn suýt chẻ trúng chân mình.|none|Rừng cây|none|none

Tranh —— tiếng kiếm ra khỏi vỏ giữa khu rừng tĩnh mịch nghe cực kỳ thanh thúy. Ngươi tay phải cầm kiếm, bày ra tư thế khởi đầu chưa mấy thuần thục —— dù tư thế chắc chắn là siêu vẹo, dù đôi chân đang run rẩy, dù ngươi biết rõ mình căn bản không phải đối thủ của đám kỵ binh tinh nhuệ đó. Nhưng ngươi không thể làm nhục mặt Thiên Sơn phái. "Đến đây... lũ tạp chủng..." Ngươi nắm chặt kiếm. Toán kỵ binh Cầm Sinh Quân thúc ngựa vây quanh, viên quan dẫn đầu lạnh lùng giơ loan đao lên: "Bắt sống cho ta, tới lúc đó bẻ gãy từng ngón tay nó, không tin nó không khai ra sào huyệt của bọn giặc Thiên Sơn ở đâu." Ngươi nghiến chặt răng, tay phải cầm kiếm, mặc dù biết mình căn bản không phải đối thủ, nhưng ít nhất —— ít nhất cũng phải chết đứng.|none|Rừng cây|none|none

"Hừ, còn khá có cốt khí đấy ——" Cứ như là ảo giác, không biết từ đâu vang lên giọng nữ, ngay sau đó một bóng đen như quỷ mị lướt qua giữa các lùm cây. Rắc! Đầu của viên sĩ quan dẫn đầu bị vặn ngược ra sau, hắn trợn tròn mắt, chưa kịp thốt ra tiếng rên nào đã ngã thẳng cẳng khỏi ngựa. "Cái gì ——!" Những tên Cầm Sinh Quân khác còn chưa kịp phản ứng, bóng đen lại lướt qua lướt lại. Theo từng tiếng động trầm đục, lại có thêm mấy tên đen đủi bị vặn gãy cổ ngã khỏi ngựa rơi xuống đất. Ngươi thậm chí không nhìn rõ bóng người đó chuyển động thế nào —— chỉ có thể thấy tàn ảnh lướt qua, rồi sau đó là có người ngã xuống. "Ma! Có ma!" "Chạy mau ——!" Những tên Cầm Sinh Quân còn lại sợ mất mật, quay đầu ngựa định bỏ chạy.|none|Rừng cây|none|none

Nhưng đã quá muộn —— bóng đen xuyên thoi trong rừng, mỗi lần xuất hiện đều lấy đi một mạng người, khinh công nhanh đến mức dường như không phải con người có thể làm được. Chưa đầy thời gian một tuần trà, hơn ba mươi tinh nhuệ Cầm Sinh Quân đã bị tiêu diệt hoàn bộ. Khu rừng lại chìm vào tĩnh lặng. Tim ngươi đập loạn xạ, mồ hôi lạnh chảy ròng ròng dọc sống lưng. Ngươi đột nhiên nhớ lại lời đồn ở ngoại bảo —— sâu trong khu rừng này có ác quỷ trú ngụ... Trong lòng ngươi rợn tóc gáy: "Lẽ nào... thực sự là ma sao?" Ngươi lẩm bẩm tự nhủ, theo bản năng lùi lại, mũi kiếm chỉ về phía xung quanh.|none|Rừng cây|none|none

Gió thổi qua ngọn cây, phát ra tiếng hú quái dị. Ánh hoàng hôn kéo dài bóng cây, trông như những con quái vật đang giương nanh múa vuốt. Tay ngươi run rẩy nhưng vẫn nắm chặt kiếm —— dù là ma, ngươi cũng phải liều một phen! Lùi lại thêm hai bước nữa. Đột nhiên —— lưng ngươi va phải một thứ gì đó mềm mại và ấm áp. Không đúng! Là người! Có người đứng sau lưng ngươi! "A ——!" Ngươi kêu thảm một tiếng, theo bản năng quay người, trường kiếm trong tay quét ngang ra! Tranh —— lưỡi kiếm vạch ra một đạo hàn quang trong không trung, nhưng lại đột ngột dừng lại khi cách yết hầu đối phương ba thốn.|Lệnh Tuyết Phi|Rừng cây|Đặc tả CG1|none

Đối phương chỉ nhẹ nhàng dùng hai ngón tay là đã kẹp chặt lấy lưỡi kiếm mà ngươi đã dốc toàn lực vung ra —— dễ dàng như kẹp một đôi đũa vậy. Lúc này ngươi mới nhìn rõ người trước mặt. Đó là một nữ tử, chính xác hơn là một nữ tử đẹp đến mức khiến người ta nghẹt thở —— dù trên mặt nàng viết đầy sự mệt mỏi và lạnh lùng, toàn thân tỏa ra khí tức băng giá khiến người khác không dám đến gần. Mái tóc đen dài hơi rối, bên ngoài áo trắng váy đen khoác thêm áo choàng lông điêu màu đen, đôi đồng tử đỏ rực lạnh lùng nhìn chằm chằm vào ngươi. Điều thu hút sự chú ý nhất là đôi tai thỏ đen rủ xuống trên đầu nàng —— khẽ rung rinh dưới ánh hoàng hôn.|Lệnh Tuyết Phi|Rừng cây|Đặc tả CG1|none

"Ngài..." Giọng ngươi run rẩy, "Ngài là..." "Tiếp thiếp đang định hỏi ngươi," nữ tử buông ngón tay đang kẹp lưỡi kiếm ra, giọng nói lạnh lùng, "Bản lĩnh không tồi, dám xông vào cấm lâm, có chuyện gì?" Ánh mắt nàng ngày càng lạnh lẽo, cứ như đang nhìn một con sâu bọ không biết sống chết: "Khu rừng này đã bị bỏ hoang nhiều năm, thiếp thân cũng ở đây thanh tịnh bấy lâu. Ngươi là kẻ đầu tiên xông vào đây." Lúc này ngươi mới nhận ra —— người vừa giết sạch đám Cầm Sinh Quân đó chính là nữ tử trước mắt này! Hơn nữa, nàng rõ ràng không hề hoan nghênh ngươi.|Lệnh Tuyết Phi|Rừng cây|Nghiêm túc|none
</MAIN_TEXT>

<SUMMARY>
Ngươi nhận ra Cầm Sinh Quân đang theo dõi để tìm lối vào Thiên Sơn phái, nên đã mạo hiểm lao vào cấm lâm truyền thuyết có ác quỷ. Trên đường trốn chạy ngựa ngã quỵ, ngươi bị thương nặng và bị quân địch bao vây. Giữa lúc nguy cấp, một bóng đen từ trong rừng lao ra, chỉ trong chớp mắt đã tiêu diệt toàn bộ hơn ba mươi quân Cầm Sinh Quân. Trong cơn kinh hãi, ngươi phát hiện người cứu mình là một nữ tử xinh đẹp —— tóc đen mắt đỏ, trên đầu có một đôi tai thỏ đen rủ xuống. Nàng lạnh lùng chất vấn lý do ngươi xông vào cấm lâm, rõ ràng không mấy thiện cảm với sự xuất hiện của ngươi.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Nữ tử tai thỏ bí ẩn đã cứu ngươi, nhưng nàng rõ ràng rất không hài lòng với sự xâm nhập của ngươi. Ngươi bị thương nặng, phải tìm cách giải thích lai lịch và giành lấy sự tin tưởng của nàng.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "15:30",
    "Người chơi": {
        "Thay đổi vị trí": "Rừng cây"
    },
    "NPC hiện tại": {
        "Lệnh Tuyết Phi": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Rừng cây"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE>`
    },
    {
        id: "Apprenticeship_Storyline_3",
        name: "Bái Sư Lệnh Tuyết Phi 3",
        priority: 98,
        conditions: {
            currentSpecialEvent: { equals: 'Apprenticeship_Storyline_2' }
        },
        effects: {},  // Vô thuộc tính biến hóa
        text: `<SLG_MODE>

<MAIN_TEXT>
"Tôi, tôi không phải cố ý xông vào đâu!" Ngươi vội vàng giải thích, giọng nói vì căng thẳng mà có chút lắp bắp, "Tôi là đệ tử ngoại môn của Thiên Sơn phái! Hôm nay nhận lệnh đi đón đoàn xe thu mua lương thực của môn phái, kết quả bị quân Cầm Sinh Quân Tây Hạ phục kích ——" Ngươi một hơi kể lại đầu đuôi sự việc: đồng hành đều đã hy sinh, bản thân bị truy sát, nhận ra kẻ địch muốn lợi dụng mình để tìm thấy lối vào Thiên Sơn phái, nên mới cố ý dẫn dụ chúng vào khu rừng này. "Để không cho chúng tìm thấy ngoại bảo, tôi chỉ còn cách chạy về phía này..." Ngươi nuốt nước bọt, "Tôi thực sự không biết đây là nơi ẩn cư của tiền bối... Xin lỗi!"|Lệnh Tuyết Phi|Rừng cây|Bình tĩnh|none

Nữ tử vô cảm nghe xong, đôi đồng tử đỏ rực đảo qua người ngươi một lượt, cuối cùng dừng lại trên bộ kình trang tiêu chuẩn rách nát, vấy đầy vết máu của Thiên Sơn phái. "Thiên Sơn phái..." Nàng lẩm bẩm tự nhủ, giọng điệu mang theo một chút cảm xúc phức tạp, "Hừ." Nàng đột nhiên lạnh cười một tiếng: "Vì để bảo vệ môn phái, thà rằng dẫn quân truy đuổi vào nơi hiểm địa chưa biết, tự đặt mình vào chỗ chết?" "Vâng." Ngươi gật đầu. "Ngu xuẩn." Nàng thản nhiên thốt ra hai chữ, "Lấy một mạng của mình thì đổi lại được gì? Thiên Sơn phái bây giờ có thêm ngươi cũng không nhiều, thiếu ngươi cũng chẳng ít." Lời nói của nàng như dao đâm vào tim ngươi, nhưng ngươi không phản bác —— vì ngươi biết nàng nói là sự thật.|Lệnh Tuyết Phi|Rừng cây|Không hài lòng|none

Ánh mắt nàng cuối cùng định vị trên bàn tay vẫn đang nắm chặt chuôi kiếm của ngươi —— tuy mũi kiếm đang run rẩy nhưng ngươi từ đầu đến cuối không hề buông ra. "Đứng thẳng người lên." Nàng đột nhiên lên tiếng. "Dạ?" "Để thiếp thân xem tư thế đứng của ngươi." Ngươi ngẩn người, cố nhịn đau đứng thẳng người dậy, bày ra tư thế khởi đầu mới học được một tháng. Tuy toàn thân đều đau nhức, tuy tư thế chắc chắn là siêu vẹo, nhưng ngươi vẫn nỗ lực thực hiện tốt nhất. Nữ tử nhìn chằm chằm ngươi một lúc, đột nhiên bước tới gần.|Lệnh Tuyết Phi|Rừng cây|Bình tĩnh|none

"Trọng tâm lệch rồi." Nàng dùng mũi chân đá đá vào chân trái của ngươi, lực không nặng nhưng ngươi suýt chút nữa ngã quỵ, "Cổ tay cầm kiếm quá cứng nhắc. Kiếm ý tán loạn." "Tôi..." "Câm miệng." Nàng đi vòng quanh ngươi một vòng, giống như đang quan sát một món hàng lỗi, "Căn cốt bình thường, tư chất thấp kém. Nội lực mỏng manh, kiếm pháp nát bét." Mỗi câu nói đều như dao đâm vào tim ngươi. "Đây chính là trình độ đệ tử hiện tại của Thiên Sơn phái sao?" Nàng lạnh cười, "Hèn chi..." Nàng không nói hết câu, nhưng sự khinh miệt và thất vọng trong giọng điệu khiến mặt ngươi nóng bừng. Trong lòng ngươi thầm nghĩ: "Vị tiền bối này võ công tuy cao nhưng cái miệng cũng độc quá, giá mà nàng nương tay chút thôi thì tôi cũng không đến mức muốn tìm cái lỗ mà chui xuống." Nhưng miệng lại không dám nói một lời.|Lệnh Tuyết Phi|Rừng cây|Đặc tả CG2|none

"Tuy nhiên..." Nàng đột nhiên dừng bước, đứng trước mặt ngươi, "Đối mặt với cục diện chắc chắn phải chết, không có quỳ gối cầu xin tha thứ, cũng không có lâm trận bỏ chạy. Thà rằng dẫn kẻ địch vào hiểm địa cũng không bán đứng môn phái." Ánh mắt nàng vẫn lạnh nhạt như cũ, "Cũng coi như có vài phần khí tiết." Ngươi ngẩn người. Đây là... khen ngợi sao?|Lệnh Tuyết Phi|Rừng cây|Đặc tả CG2|none

"Thiếp thân thực sự nhìn không nổi trình độ đệ tử Thiên Sơn phái bây giờ nữa." Nàng trầm ngâm một lát, tai thỏ đen khẽ động, "Thôi được rồi, thiếp thân sẽ thu nhận ngươi làm đồ đệ, đích thân điều giáo một phen." Cái gì?! Não ngươi ù đi một tiếng. Thu đồ đệ? Nữ tử lạnh lùng kiêu sa, võ công tuyệt thế trước mắt này muốn thu ngươi làm đồ đệ? Đây... đây là bánh bao từ trên trời rơi xuống sao? Không đúng!|Lệnh Tuyết Phi|Rừng cây|Bình tĩnh|none

"Vãn bối... vãn bối không thể." Ngươi cắn răng nói. "Hử?" Nữ tử quay đầu lại, ánh mắt nguy hiểm, "Ngươi đang từ chối thiếp thân?" "Không phải..." Ngươi vã mồ hôi hột, "Là vãn bối đã bái vào Thiên Sơn phái, tuy là đệ tử ngoại môn nhưng cũng đã chính thức nhập môn. Theo quy củ giang hồ, không thể lạy thầy khác, nếu không chính là phản bội sư môn..." "Quy củ giang hồ?" Nàng lạnh cười, "Quy củ của Thiên Sơn phái mà cần một tên đệ tử ngoại môn như ngươi phải dạy ta sao?" "Tôi không có... ý tôi là..."|Lệnh Tuyết Phi|Rừng cây|Không hài lòng|none

"Hay là," nàng nheo mắt lại, "Ngươi cảm thấy thiếp thân không xứng làm sư phụ của ngươi?" "Không dám không dám!" Ngươi vội vàng lắc đầu, "Tiền bối võ công cái thế, vãn bối cao không tới! Chỉ là... chỉ là thực sự không thể vi phạm quy củ sư môn..." Nữ tử chằm chằm nhìn ngươi, không nói một lời. Khu rừng yên tĩnh đến đáng sợ. Tim ngươi đập loạn xạ, mồ hôi lạnh chảy ròng ròng dọc sống lưng. Nhưng ngươi vẫn nghiến răng, không hề đổi ý. Ngươi nghĩ thầm: "Thôi xong, hôm nay chắc là phải phơi xác ở đây rồi."|Lệnh Tuyết Phi|Rừng cây|Nghiêm túc|none
</MAIN_TEXT>

<SUMMARY>
Ngươi giải thích cho nữ tử bí ẩn về việc bị Cầm Sinh Quân phục kích và dẫn dụ địch vào rừng. Nữ tử tuy chế nhạo ngươi ngu xuẩn nhưng cũng công nhận khí tiết thà chết chứ không bán đứng môn phái của ngươi. Sau khi kiểm tra tư thế đứng và căn cốt, nàng dùng những lời lẽ "độc miệng" nhận xét tư chất ngươi bình thường, kiếm pháp nát bét, nhưng lại bất ngờ đề nghị thu ngươi làm đồ đệ. Do đã bái vào Thiên Sơn phái, theo quy củ giang hồ không được lạy thầy khác nên ngươi đành đánh bạo từ chối. Ánh mắt nữ tử chuyển lạnh, chất vấn có phải ngươi coi thường nàng không, bầu không khí nhất thời trở nên cực kỳ căng thẳng.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Nữ tử bí ẩn đề nghị thu ngươi làm đồ đệ, ngươi dùng quy củ giang hồ để khéo léo từ chối, nàng rõ ràng rất không hài lòng về điều này. Không khí bế tắc, ngươi không biết bước tiếp theo nàng sẽ làm gì.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "16:00",
    "Người chơi": {
        "Thay đổi vị trí": "Rừng cây"
    },
    "NPC hiện tại": {
        "Lệnh Tuyết Phi": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Rừng cây"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE>`
    },
    {
        id: "Apprenticeship_Storyline_4",
        name: "Bái Sư Lệnh Tuyết Phi 4",
        priority: 97,
        conditions: {
            currentSpecialEvent: { equals: 'Apprenticeship_Storyline_3' }
        },
        effects: {},  // Vô thuộc tính biến hóa
        text: `<SLG_MODE>

<MAIN_TEXT>
Nửa ngày trôi qua —— "Hừ." Nàng đột nhiên khẽ cười một tiếng, đưa tay nhấn vào chuôi kiếm bên hông. Xong rồi. Lòng ngươi chùng xuống. Bản thân vừa mới từ chối nàng, khiến nàng không vui, bây giờ nàng định giết người diệt khẩu rồi. Ngươi nắm chặt thanh kiếm trong tay, tuy biết rõ mình căn bản không phải đối thủ của nàng —— đừng nói là đánh thắng, ngay cả cầm cự qua một chiêu dưới tay nàng thôi cũng khó —— nhưng ngươi vẫn bày ra tư thế phòng thủ. Ít nhất... ít nhất cũng phải chết một cách có tôn trọng chút.|Lệnh Tuyết Phi|Rừng cây|Nghiêm túc|none

"Ngươi sợ không?" Giọng nàng truyền tới. "Sợ." Ngươi thật thà trả lời, giọng nói đang run rẩy, "Nhưng... nhưng quy củ nên giữ thì vẫn phải giữ. Lời nên nói thì vẫn phải nói." "Ồ?" Nàng nhíu mày, "Biết thiếp thân định giết ngươi?" "Vãn bối... vãn bối đoán là như vậy." Ngươi nuốt nước bọt, nỗ lực làm cho giọng mình đừng run rẩy quá mức, "Tuy nhiên tiền bối cao nghĩa, cứu mạng vãn bối, vãn bối vô cùng cảm kích. Nếu vì vãn bối lỡ lời mạo phạm khiến tiền bối không vui... vãn bối xin nhận tội."|Lệnh Tuyết Phi|Rừng cây|Bình tĩnh|none

Nữ tử khẽ nhếch môi tạo thành một độ cong cực nhạt. Nụ cười đó thoáng qua trong tích tắc nhưng ngươi thực sự đã nhìn thấy. Nàng đưa thanh kiếm đang cầm ngang ra trước mặt ngươi. "Cầm lấy." Ngươi ngẩn người, đưa tay đỡ lấy thanh kiếm đó. Thân kiếm thon dài, toàn thân đen bóng nhưng mũi kiếm lại tỏa ra hàn quang nhàn nhạt, nhìn qua là biết không phải loại sắt thép tầm thường. Quan trọng nhất là —— trên chuôi kiếm có khắc huy hiệu của Thiên Sơn phái —— một đóa tuyết liên bao quanh thanh bảo kiếm!|Lệnh Tuyết Phi|Rừng cây|Mỉm cười|none

"Đây, đây là..." Ngươi trợn tròn mắt. "Huy hiệu Thiên Sơn phái." Nàng thản nhiên nói, "Thấy chưa?" "Ngài... Ngài cũng là người của Thiên Sơn phái?!" "Lệnh Tuyết Phi, đệ tử đời thứ bảy của Thiên Sơn phái." Tai thỏ của nàng rung rinh, "Tính ra thì là bậc tiền bối của ngươi." Lệnh Tuyết Phi?! Não ngươi lại ù đi một tiếng. Cái tên này ngươi đã nghe tiên sinh kể chuyện ở ngoại bảo nhắc tới không ít lần khi còn nhỏ, trong truyền thuyết là Kiếm Thánh nghìn năm mới có một của Thiên Sơn phái, Thị Kiếm trưởng lão, từng cầm một thanh khoái kiếm, một thân một mình bình định quần ma Bái Hỏa giáo, tiêu diệt hơn mười phân đà của tà giáo!|Lệnh Tuyết Phi|Rừng cây|Bình tĩnh|none

Hèn chi... hèn chi võ công của nàng lại đáng sợ đến thế! Trong lòng ngươi thầm nghĩ: "Khoan đã, đây chính là Lệnh Tuyết Phi trong truyền thuyết? Tiên sinh kể chuyện bảo nàng cao tám thước, lưng hùm vai gấu, một bữa cơm ăn sống năm tên người Đát... chuyện này sai lệch quá nhiều đi!" "Đã cùng là đệ tử Thiên Sơn, việc bái sư vừa nói lúc nãy coi như không vi phạm quy củ nữa chứ?" Nàng liếc nhìn ngươi một cái, ánh mắt mang theo chút trêu chọc.|Lệnh Tuyết Phi|Rừng cây|Đắc ý|none

"Dạ không..." Ngươi vội vàng lắc đầu, "Chỉ là vãn bối đức mỏng tài hèn..." "Thiếp thân không quan tâm ngươi có đức hay không, có tài hay không." Nàng ngắt lời ngươi, "Những điều ngươi không hiểu, những việc ngươi không làm được, thiếp thân sẽ dạy hết cho ngươi." Giọng nàng đột nhiên trở nên lạnh lùng cứng rắn: "Tất nhiên, ngươi cũng có thể từ chối. Dù sao thiếp thân cũng không thiếu đồ đệ." "Không không không!" Ngươi vội vàng quỳ xuống, "Đệ tử bằng lòng! Đệ tử bằng lòng bái sư!" Ngươi nghĩ bụng: Đùa à, đệ nhất cao thủ của Thiên Sơn phái muốn thu mình làm đồ đệ, chuyện tốt thế này biết tìm đâu ra chứ?!|Lệnh Tuyết Phi|Rừng cây|Đặc tả CG3|none

"Đứng lên đi." Nàng phất phất tay, "Vi sư không thích những lễ nghi hư ảo này. Ngươi chỉ cần nhớ kỹ —— yêu cầu của vi sư rất cao. Nếu dám lười biếng bê trễ, vi sư tuyệt không nương tình." "Đệ tử đã hiểu!" "Rất tốt." Nàng gật đầu, sau đó nhíu mày nhìn ngươi, "Bây giờ, dẫn vi sư về Thiên Sơn phái. Cái bộ dạng nửa sống nửa chết này của ngươi còn cần nhanh chóng cứu chữa." "Dạ!" Ngươi vội vàng đứng lên, cố nhịn đau chuẩn bị dẫn đường.|Lệnh Tuyết Phi|Rừng cây|Đặc tả CG3|none

"Khoan đã." Nàng đột nhiên đưa tay vỗ vào vai ngươi. Một luồng nội lực ấm áp truyền vào cơ thể, cơn đau lập tức giảm đi quá nửa. "Đối phó tạm chút đi, đỡ cho ngươi đang đi giữa đường thì chết, lại phiền thiếp thân phải nhặt xác." Nàng thản nhiên nói, "Việc chữa trị thực sự thì về rồi tính." "Đệ tử bái tạ ân sư!" Lòng ngươi ấm áp, lời cảm kích buột miệng thốt ra. "Sến súa chết đi được, nổi da gà..." Giọng nàng vẫn lạnh lùng thậm chí mang theo sự ghét bỏ, nhưng khóe môi lại nhếch lên một độ cong khó nhận ra, "Đợi vượt qua được sự điều giáo của vi sư rồi hãy nói, đồ đệ ngu ngơ." Ngươi len lén liếc nhìn nàng một cái —— quả nhiên, miệng thì nói ghét bỏ nhưng tai thỏ lại khẽ rung rinh một cái.|Lệnh Tuyết Phi|Rừng cây|Ngượng ngùng|none
</MAIN_TEXT>

<SUMMARY>
Ngươi cứ ngỡ Lệnh Tuyết Phi định giết người diệt khẩu, nhưng nàng lại đưa ra thanh bảo kiếm có khắc huy hiệu Thiên Sơn phái, tiết lộ danh tính chính là Kiếm Thánh Thiên Sơn truyền thuyết —— đệ tử đời thứ bảy Lệnh Tuyết Phi. Đều là tiền bối đồng môn, việc bái sư không còn phạm quy củ, ngươi lập tức quỳ lạy nhận sư phụ. Lệnh Tuyết Phi cảnh cáo yêu cầu tu luyện cực cao, không được lười biếng, sau đó dùng nội lực tạm thời trị thương cho ngươi rồi chuẩn bị dẫn ngươi quay về Thiên Sơn phái.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Ngươi chính thức bái Lệnh Tuyết Phi làm sư phụ, trở thành đồ đệ duy nhất của Kiếm Thánh Thiên Sơn. Nàng tạm thời dùng nội lực trị thương cho ngươi và chuẩn bị đưa ngươi về môn phái để chữa trị chính thức.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "17:00",
    "Người chơi": {
        "Thay đổi vị trí": "Rừng cây"
    },
    "NPC hiện tại": {
        "Lệnh Tuyết Phi": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Rừng cây"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE>`
    },
    {
        id: "Apprenticeship_Storyline_5",
        name: "Bái Sư Lệnh Tuyết Phi 5 - Quy tông",
        priority: 96,
        conditions: {
            currentSpecialEvent: { equals: 'Apprenticeship_Storyline_4' }
        },
        effects: {},  // Vô thuộc tính biến hóa
        text: `< SLG_MODE >

<MAIN_TEXT>
Khi màn đêm buông xuống, cuối cùng ngươi cũng đưa Lệnh Tuyết Phi tới cổng núi Thiên Sơn phái. "{{user}} về rồi! Mau đi gọi người!" Đệ tử trực gác cổng nhận ra bạn, "Huynh ấy bị thương rồi —— khoan đã, người bên cạnh huynh ấy là ai?" Ánh mắt mọi người đều đổ dồn vào Lệnh Tuyết Phi. Nàng vẫn là bộ dáng lạnh lùng đó, áo choàng da chồn đung đưa trong gió đêm, đôi đồng tử đỏ rực đảo qua đám đông, không nói một lời. Đệ tử thủ vệ nuốt nước bọt: "Vị cô nương này, cho hỏi cô là ——"|Lệnh Tuyết Phi|Sơn môn|Bình tĩnh|none

Lệnh Tuyết Phi mặt không biểu cảm, dùng cùi chỏ huých nhẹ bạn một cái. Ngươi hiểu ý, vội vàng thay nàng giải thích với mọi người: "Nàng... nàng là người của môn phái! Là tiền bối đời thứ bảy của bản môn!" Ngươi thầm nhủ trong lòng: "Tuy rằng ta cũng rất muốn nói nàng là nữ quỷ ta nhặt được trong rừng... nhưng ta sợ bị ăn đòn." "Nhưng mà ta chưa từng thấy ——" Lời còn chưa dứt, phía bên kia cổng núi đột nhiên vang lên những bước chân dồn dập. Thân ảnh cao lớn của Phá Trận Tử lao ra từ bóng tối, theo sau là Động Đình Quân, Huyền Thiên Thanh cùng mấy vị trưởng lão.|Lệnh Tuyết Phi|Sơn môn|Bình tĩnh|none

"Nghe nói {{user}} bị thương quay về, sao lại ——" Lời nói của Phá Trận Tử nghẹn lại nơi cổ họng. Ông đã nhìn thấy Lệnh Tuyết Phi. Không khí như đông đặc lại. Phá Trận Tử trợn tròn mắt, Động Đình Quân sững sờ tại chỗ, ngay cả Huyền Thiên Thanh vốn luôn trầm ổn cũng kinh ngạc đến mức theo phản xạ mà đẩy đẩy gọng kính. "Tuyết... Tuyết Phi?" Giọng Phá Trận Tử có chút run rẩy, "Muội... muội về rồi sao?" "Ừ." Lệnh Tuyết Phi mặt không biểu cảm gật gật đầu, "Về rồi."|Lệnh Tuyết Phi|Sơn môn|Bình tĩnh|none

Huyền Thiên Thanh hít sâu một hơi: "Sư muội, muội những năm qua..." "Không cần lo lắng." Lệnh Tuyết Phi lập tức ngắt lời hàn huyên, "Thiếp thân vẫn sống tốt." "Tuyết Phi..." Động Đình Quân cố giữ bình tĩnh, nhưng vành mắt đã đỏ lên, "Muội cuối cùng cũng chịu về rồi..." "Chỉ là thuận đường thôi." Lệnh Tuyết Phi thản nhiên nói, "Tên đệ tử này dẫn theo truy binh tới tận nơi thiếp thân ẩn cư, thiếp thân đành phải đưa hắn về."|Lệnh Tuyết Phi|Sơn môn|Bình tĩnh|none

Ngươi đứng một bên, nhìn phản ứng của mấy vị trưởng lão, trong lòng đột nhiên thấy có chút không thoải mái. Ngươi thầm nghĩ: "Hóa ra... nàng một mình ở trong khu rừng đó, đã sống rất lâu rồi sao?" "Truy binh?" Phá Trận Tử nhíu mày, "Truy binh gì?" Ngươi vội vàng tiến lên, đem chuyện xảy ra ngày hôm nay thuật lại đầu đuôi: Phục kích, đồng bạn hy sinh, rò rỉ tình báo, Cầm Sinh quân...|none|Sơn môn|none|none

"Chuyện này..." Huyền Thiên Thanh trầm ngâm nói, "Chuyện này có điểm kỳ quái, còn cần bàn bạc kỹ hơn. Ngươi đi xử lý vết thương trước, tình hình chi tiết ngày mai hãy nói." "Rõ." "Tuyết Phi," Ngữ khí của Phá Trận Tử dịu lại, "Chỗ ở của muội ta đã lệnh người đi chuẩn bị, sương phòng trưởng lão vẫn luôn để dành cho muội ——" "Không cần đâu." Giọng Lệnh Tuyết Phi lạnh như băng, "Thiếp thân ở phòng nữ đệ tử bình thường là được, không cần tốn sức."|Lệnh Tuyết Phi|Sơn môn|Nghiêm túc|none

"Nhưng mà ——" "Cứ quyết định như vậy đi." Nàng không cho bất cứ ai cơ hội lên tiếng nữa, đi thẳng về phía khu nhà ở của nữ đệ tử. Ngươi ngẩn người một lát, vội vàng đuổi theo: "Sư phụ! Đợi con với!" "Sư phụ?!" Ba vị trưởng lão nhìn nhau ngơ ngác. Ngươi quay đầu lại, thấy trên mặt bọn họ viết đầy vẻ chấn kinh —— và cả một sự... trút bỏ gánh nặng khó tả?|none|Sơn môn|none|none

"Đây quả thực là..." Huyền Thiên Thanh có chút suy tư, "Có lẽ là một bước ngoặt." Đôi đồng tử xanh thẳm của Động Đình Quân xẹt qua một tia sáng: "Ít nhất... nàng đã chịu trở về rồi." "Đi đi." Phá Trận Tử phẩy phẩy tay, giọng nói có chút khàn khàn, "Chăm sóc sư phụ của muội cho tốt." Ngươi gật gật đầu, rảo bước đuổi theo Lệnh Tuyết Phi.|none|Sơn môn|none|none
</MAIN_TEXT>

<SUMMARY>
Màn đêm buông xuống, bạn đưa Lệnh Tuyết Phi quay về cổng núi Thiên Sơn phái. Phá Trận Tử, Động Đình Quân, Huyền Thiên Thanh cùng các trưởng lão nghe tin chạy đến, kinh ngạc thấy Lệnh Tuyết Phi mất biệt nhiều năm đã trở về, vô cùng xúc động. Lệnh Tuyết Phi đáp lại lạnh nhạt, nói chỉ là thuận đường đưa bạn về. Bạn báo cáo với các trưởng lão về tình hình bị phục kích và rò rỉ tình báo. Lệnh Tuyết Phi từ chối ở sương phòng trưởng lão, nhất quyết ở phòng nữ đệ tử bình thường. Khi bạn đuổi theo gọi "Sư phụ", các trưởng lão kinh ngạc nhưng cũng lộ vẻ trút bỏ gánh nặng, dường như việc nàng trở về và nhận đồ đệ là một bước ngoặt nào đó.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Ngươi đưa Lệnh Tuyết Phi trở lại Thiên Sơn phái, các trưởng lão đối với việc nàng trở về vừa kinh ngạc vừa cảm thán. Việc Lệnh Tuyết Phi nhận ngươi làm đồ đệ đã được các trưởng lão biết đến, dường như ẩn chứa thâm ý sâu xa nào đó.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "19:30",
    "Người chơi": {
        "Thay đổi vị trí": "Sơn môn"
    },
    "NPC hiện tại": {
        "Lệnh Tuyết Phi": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Sơn môn"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    {
        id: "Apprenticeship_Storyline_6",
        name: "拜师苓雪妃6",
        priority: 95,
        conditions: {
            currentSpecialEvent: { equals: 'Apprenticeship_Storyline_5' }
        },
        effects: {
            GameMode: { set: 0 },
            inputEnable: { set: 1 },
            mapLocation: { set: 'Thiên Sơn Phái' },
            companionNPC: { set: [] },
            userLocation: { set: 'nvdizi' },
            "npcFavorability.O": { add: 20 },
            "npcVisibility.O": { set: true }
        },  // 无属性变化
        text: `< SLG_MODE >

<MAIN_TEXT>
Phòng nữ đệ tử là một dãy nhà gỗ được xây dựng dựa vào sườn núi, phía sâu nhất có vài gian phòng đơn hẻo lánh, bình thường rất ít người ở —— vì nằm ở góc khuất của thung lũng, mùa đông ban đêm dậy đi vệ sinh có thể chết cóng. Lệnh Tuyết Phi lại cố tình chọn gian phòng sâu nhất, hẻo lánh nhất đó. "Sư phụ, ở đây..." Ngươi nhìn căn nhà nhỏ nát bấy trước mắt, định nói lại thôi. Căn phòng không lớn, chỉ có một chiếc giường gỗ, một cái bàn, một cái ghế, góc tường còn có vài chỗ lộng gió. "Đủ rồi." Lệnh Tuyết Phi thản nhiên nói, "Vi sư không cần quá nhiều." Ngươi muốn nói gì đó, nhưng lại không biết nên nói gì. Ngươi thầm nghĩ: "Nàng rõ ràng là trưởng lão, tại sao lại ở cái nơi như thế này..."

"Đi lấy chậu nước đến đây." Nàng ngồi xuống ghế, "Vi sư muốn xử lý vết thương cho ngươi." "Dạ!" Ngươi chạy đi lấy nước, lúc quay lại phát hiện trong phòng có thêm một ngọn đèn dầu —— không biết là ai đã âm thầm đưa tới, có lẽ là một vị sư tỷ nào đó đi ngang qua. Ánh đèn vàng mờ ảo lung linh, chiếu rọi khuôn mặt nghiêng đầy mệt mỏi của Lệnh Tuyết Phi. Ngươi thầm nghĩ: "Hóa ra... cũng có người đang thầm lặng quan tâm nàng."

Nàng ra hiệu cho ngươi nằm sấp lên giường, bắt đầu giúp ngươi xử lý vết thương. Động tác của nàng rất nhẹ, nhưng khi bột thuốc rắc lên vẫn khiến ngươi đau đến mức nhe răng trợn mắt. "Nhịn chút." Nàng thản nhiên nói, "Chút đau đớn này cũng không nhịn được sao?" "Đệ tử nhịn được!" "Hừ, cứng miệng." Lệnh Tuyết Phi bắt đầu băng bó vết thương cho ngươi, đột nhiên lên tiếng: "Vi sư có vài quy tắc, ngươi phải nhớ kỹ." "Dạ! Xin sư phụ chỉ dạy!"

"Thứ nhất," nàng nhìn xuống, đôi mắt đỏ rực nhìn thẳng vào ngươi, "Vi sư hiện là thân mang tội, không còn là trưởng lão. Ngươi cũng không được phép tự xưng là nội môn đệ tử. Trước mặt người ngoài, ngươi vẫn là ngoại môn đệ tử. Hiểu chưa?" Ngươi vốn định đòi lại công bằng cho nàng, nhưng nhìn ánh mắt kiên quyết của nàng, chỉ đành gật đầu: "Đệ tử... hiểu rồi."

"Thứ hai," nàng tiếp tục nói, "Đừng nhắc đến quan hệ sư đồ trước mặt người ngoài. Hành sự thấp điệu, không được phô trương. Nếu có người hỏi, ngươi cứ nói..." Nàng khựng lại một chút. "Cứ nói ngươi nhặt được một phụ nữ nông thôn ở trong rừng mang về." "...Phụ nữ nông thôn??? Sư phụ, chuyện này cũng quá ——" "Có ý kiến gì sao?" "Không không! Đệ tử không dám!" Ngươi thầm mắng: "Ai mà tin chứ! Phụ nữ nông thôn nào mà xinh đẹp thế này! Phụ nữ nông thôn nào mà có thể tay không vặn gãy cổ quân Cầm Sinh!"

"Rất tốt. Thứ ba," ngữ điệu của nàng hơi hòa hoãn lại một chút, "Căn cơ của ngươi còn nông cạn, bài học buổi sáng và luyện tập hàng ngày không được lười biếng, tu võ kỵ nhất là nóng nảy, đợi đến lúc thời cơ chín muồi, vi sư tự nhiên sẽ truyền thụ hết tất cả cho ngươi." "Đệ tử ghi nhớ kỹ!" "Ngoài ra," hiếm hoi thay, Lệnh Tuyết Phi lại có chút do dự, "Đừng tìm cách dò hỏi quá khứ của vi sư. Cũng đừng tìm cách an ủi vi sư."
</MAIN_TEXT>

<SUMMARY>
Lệnh Tuyết Phi chọn ở gian phòng đơn hẻo lánh và nát bấy nhất trong dãy phòng nữ đệ tử, từ chối đãi ngộ trưởng lão. Trong khi xử lý vết thương cho ngươi, nàng đặt ra ba quy tắc: Một, nàng là thân mang tội, ngươi không được tự xưng đệ tử nội môn; Hai, không được tiết lộ quan hệ sư đồ, nếu bị hỏi hãy nói nàng là thôn phụ ngươi nhặt được; Ba, tu hành không được nôn nóng, sau này sẽ truyền thụ hết. Cuối cùng nàng do dự dặn —— đừng hỏi quá khứ cũng đừng an ủi nàng.
</SUMMARY>

<SIDE_NOTE>
{
    "Thời gian": "20:30",
    "Người chơi": {
        "Thay đổi vị trí": "Phòng nữ đệ tử"
    },
    "NPC hiện tại": {
        "Lệnh Tuyết Phi": {
            "Thay đổi hảo cảm": "Tăng lên",
            "Thay đổi vị trí": "Phòng nữ đệ tử"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    {
        id: "Jisi_Letter_1",
        name: "Di thư người cũ · Cơ Tự 1",
        priority: 80,
        conditions: {
            currentWeek: { min: 1 },
            "npcFavorability.E": { min: 50 }
        },
        effects: {
            GameMode: { set: 1 },
            inputEnable: { set: 0 },
            mapLocation: { set: 'Thôn Bostan' },
            companionNPC: { push: 'Cơ Tự' }
        },
        text: `< SLG_MODE >

<MAIN_TEXT>
Vào một buổi chiều chạng vạng của tuần mới, khi đi ngang qua Tàng Kinh Các, ngươi thấy Cơ Tự đang ngồi một mình trên bậc đá trước cửa, tay cầm một bức thư rồi ngẩn người xuất thần. Ánh tà dương buông xuống người nàng, đôi mắt màu hổ phách vốn dĩ luôn híp lại cười giờ đây dường như đang bị bao phủ bởi một lớp sương mù, đôi tai cáo màu bạc rũ xuống, cái đuôi cáo xù xì cũng yên lặng rũ phía sau. Ngươi chưa bao giờ thấy nàng có bộ dạng này —— vị đại sư tỷ vô tư lự này, thế mà cũng có lúc thất hồn lạc phách như vậy.|Cơ Tự|Võ hiệp môn phái|U sầu|none

"Đại sư tỷ?" Ngươi khẽ gọi. Nàng giật mình tỉnh lại, theo bản năng giấu bức thư ra sau lưng, động tác hoảng loạn như thể bị bắt quả tang một bí mật nhỏ: "A... là đệ à. Khô, không có việc gì đâu." Nhìn bộ dạng định giấu đầu lòi đuôi của nàng, trong lòng ngươi vừa có chút hiếu kỳ vừa có chút lo lắng. Do dự một chút, ngươi vẫn ngồi xuống cạnh nàng. Nàng im lặng một lúc, cuối cùng vẫn đưa bức thư cho ngươi: "Đệ... đệ xem đi."|Cơ Tự|Võ hiệp môn phái|Ngập ngừng|none

Ngươi nhận lấy bức thư và mở ra —— giấy thư đã có chút ố vàng, các góc bị mòn, rõ ràng đã được người ta đọc đi đọc lại rất nhiều lần. Chữ trên thư ngay ngắn thanh tú, viết rằng: "Cơ Tự tiền bối đài giám: Ta là hậu nhân của Chu Hoài Viễn, gia tổ phó thác, hậu nhân nếu có cơ hội nhất định phải tìm thăm tiền bối, đem di vật của tổ thượng hoàn trả. Tổ thượng sinh tiền thường nhắc tới tiền bối, nói rằng tiền bối là tri kỷ cả đời này, vĩnh chí nan vong..." Ánh mắt bạn dừng lại ở bốn chữ "vĩnh chí nan vong" (khắc cốt ghi tâm), trong lòng bỗng dâng lên một cảm xúc khó tả chưa từng có.|Cơ Tự|Võ hiệp môn phái|U sầu|none

"Chu Hoài Viễn..." Ngươi đọc cái tên này, cố gắng làm cho giọng mình nghe thật bình tĩnh, "Đây là ai?" Cơ Tự im lặng hồi lâu, giọng nói khẽ như một tiếng thở dài: "Là... một người cũ của ta." Đôi tai cáo của nàng khẽ run lên, "Đó là chuyện từ rất lâu, rất lâu về trước rồi..." Nàng ngẩng đầu nhìn về phía xa, đôi mắt màu hổ phách in bóng ráng chiều mang theo một nỗi u sầu mà ngươi không thể hiểu thấu, "Hoài Viễn... là người đầu tiên ta quen biết ở Thiên Sơn phái này."|Cơ Tự|Võ hiệp môn phái|U sầu|none

Người đầu tiên. Ngươi nhai lại mấy chữ này, lòng như bị thứ gì đó đâm nhẹ một cái. "Lúc đi Hoài Viễn nói sẽ quay lại, kết quả đi một lần này... chính là hơn một trăm năm." Giọng nàng ngày càng nhẹ, "Ta cứ ngỡ... cứ ngỡ rằng núi sông cách trở, đường xá đứt đoạn, Hoài Viễn sớm đã chết giữa đường rồi. Không ngờ... thế mà thật sự đến được Trung Nguyên, còn lập gia đình, có hậu nhân..." Nàng cúi đầu, mái tóc dài màu bạc rũ xuống che đi biểu cảm. Ngươi thấy bờ vai nàng khẽ run rẩy.|Cơ Tự|Võ hiệp môn phái|U sầu|none

Trong lòng ngươi ngũ vị tạp trần. Hóa ra trong lòng đại sư tỷ luôn giấu một người như vậy —— một người khiến nàng chờ đợi hơn một trăm năm. Cái người tên Chu Hoài Viễn đó... rốt cuộc là hạng người gì mà có thể khiến nàng nhớ mãi không quên đến tận bây giờ? Ngươi há miệng định nói mấy câu an ủi, nhưng phát hiện cổ họng như bị thứ gì chặn lại. "Đại sư tỷ," Ngươi cân nhắc lên tiếng, "Tỷ định đi dự hẹn sao?" "Tất nhiên là phải đi rồi." Nàng ngẩng đầu, vành mắt hơi đỏ nhưng vẫn cố nặn ra một nụ cười, "Đều là chuyện từ trăm năm trước rồi, có gì mà phải đau lòng chứ. Có thể gặp được hậu nhân của cố nhân cũng là một đoạn duyên phận."|Cơ Tự|Võ hiệp môn phái|Mỉm cười|none

Nàng đứng dậy, phủi phủi quần áo, sau đó quay đầu nhìn ngươi. Đôi mắt màu hổ phách mang theo sự bất an và kỳ vọng hiếm thấy: "Ngày hẹn... chính là ngày mai rồi. Đệ... đệ có sẵn lòng đi cùng ta không?" Ngươi ngẩn người. "Ta... ta đi một mình e là không kìm nén được cảm xúc, làm mất mặt bậc bề trên." Giọng nàng mang theo sự bất an hiếm thấy, đuôi cáo quẫy quẫy không tự nhiên, "Đệ đi theo ta, nếu ta... nếu ta có khóc ra, đệ thay ta đỡ lời..." Nàng nói đến cuối, giọng gần như nhỏ đến mức không nghe thấy.|Cơ Tự|Võ hiệp môn phái|Ngượng ngùng|none

Nhìn bộ dạng cố tỏ ra kiên cường của nàng, vị chua xót trong lòng ngươi càng đậm hơn. Nhưng ngươi vẫn gật đầu: "Đệ sẽ đi cùng tỷ." "Tốt!" Đôi tai cáo của nàng lập tức dựng đứng lên, đuôi cáo cũng khôi phục nhịp điệu vẫy, "Vậy... vậy sáng sớm mai chúng ta xuất phát! Đến thôn Bostan cũng mất một đoạn đường đấy!" Nàng vừa nói vừa trầm giọng xuống, "Ta... ta phải chuẩn bị thật kỹ mới được. Gặp hậu đại của cố nhân mà, không thể quá thất lễ được..." Nhìn bộ dạng lo lắng đó của nàng, ngươi thầm thở dài: "Nàng... thực sự rất để tâm đến người đó."|Cơ Tự|Võ hiệp môn phái|Ngượng ngùng|none
</MAIN_TEXT>

<SUMMARY>
Vào một ngày của tuần mới, ngươi phát hiện Cơ Tự ngồi một mình trước cửa Tàng Kinh Các, vẻ mặt u sầu cầm một bức thư. Thư là của hậu duệ Chu Hoài Viễn, cố nhân từ trăm năm trước gửi tới để trả lại di vật. Cơ Tự nhắc tới Chu Hoài Viễn là "người đầu tiên nàng quen biết", chờ đợi hơn trăm năm nhưng không bao giờ gặp lại. Nàng thỉnh cầu ngươi đi cùng đến buổi hẹn vì sợ bản thân thất thố. Ngươi đồng ý, nhưng trong lòng lại dâng lên nỗi chua xót khó tả.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Cơ Tự nhận được thư của hậu duệ cố nhân từ trăm năm trước, hẹn gặp tại thôn Bostan. Nàng có biểu cảm phức tạp, yêu cầu ngươi đi cùng. Người đã khiến nàng chờ đợi hơn trăm năm đó rốt cuộc là ai?",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "18:00",
    "Người chơi": {
        "Thay đổi vị trí": "Võ hiệp môn phái"
    },
    "NPC hiện tại": {
        "Cơ Tự": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Võ hiệp môn phái"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    {
        id: "Jisi_Letter_2",
        name: "Di thư người cũ · Cơ Tự 2",
        priority: 79,
        conditions: {
            currentSpecialEvent: { equals: 'Jisi_Letter_1' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Sáng sớm hôm sau, các ngươi lên đường đến thôn Bostan. Hôm nay Cơ Tự đặc biệt thay một bộ quần áo sạch sẽ ngăn nắp, mái tóc bạc dài được chải chuốt tỉ mỉ, trên tai cáo còn cài một bông tuyết liên nhỏ. Cả đoạn đường nàng đều có chút tâm thần bất định, chốc chốc lại sờ sờ bức thư trong lòng, chốc chốc lại thẩn thờ ngân nga một giai điệu. Ngươi đi sau nàng, nhìn bộ dạng hồn siêu phách lạc đó của nàng, trong lòng nghẹn lại. "Đại sư tỷ," Ngươi không nhịn được lên tiếng, "Giai điệu tỷ đang ngân nga là gì vậy?"|Cơ Tự|Sơn đạo|Ngập ngừng|none

"À, cái này sao," Nàng quay đầu lại, trên mặt mang theo thần sắc hoài niệm, "Là Hoài Viễn dạy ta. Một bài đồng dao Trung Nguyên." Giọng nàng nhè nhẹ, như đang hồi tưởng lại chuyện từ rất lâu về trước, "Hoài Viễn nói đây là khúc hát quê hương, nói có một ngày dẫn ta đi Trung Nguyên, sẽ dẫn ta cùng về quê hương xem thử..." Nàng không nói tiếp nữa, chỉ tiếp tục khẽ ngân nga —— Hóa ra nàng ngay cả khúc hát người đó dạy cũng nhớ rõ mồn một như vậy.|Cơ Tự|Sơn đạo|U sầu|none

"Đại sư tỷ," Ngươi cân nhắc từ ngữ, "Tỷ và Chu Hoài Viễn... rốt cuộc là quan hệ gì?" Bước chân Cơ Tự khựng lại một chút. Im lặng hồi lâu nàng mới lên tiếng: "Hoài Viễn... là người bạn đầu tiên ta quen biết." Giọng nàng có chút phiêu hốt, "Lúc đó ta vừa được Trương công thu lưu, không biết võ công, không hiểu nhân tình thế thái, vẫn còn mông muội. Những người khác đều coi thường ta, chỉ có Hoài Viễn..." Nàng đột nhiên dừng lại, tai cáo hơi ửng đỏ. "Chỉ có Hoài Viễn làm sao?" Ngươi truy hỏi.|Cơ Tự|Sơn đạo|Ngượng ngùng|none

"Chỉ có Hoài Viễn chủ động tiếp cận ta," Nàng nhỏ giọng nói, "Dạy ta luyện kiếm, dạy ta viết chữ..." Giọng nàng ngày càng nhẹ, "Hoài Viễn luôn gọi ta là 'Tiểu hồ ly', nói tai của ta rất đáng yêu, nói đuôi của ta xù xì sờ rất thích..." Nghe những cách gọi thân mật này, lòng ngươi như bị đổ một hũ giấm chua. Tiểu hồ ly? Sờ đuôi? Chuyện này... chuyện này rõ ràng là hành động chỉ nam nữ yêu đương mới có đúng không?|Cơ Tự|Sơn đạo|Ngượng ngùng|none

"Hoài Viễn còn nói, đợi đánh xong trận giặc này, sẽ dẫn ta đi Trung Nguyên." Cơ Tự tiếp tục nói, hoàn toàn không chú ý đến sắc mặt ngày càng khó coi của bạn, "Nói Trung Nguyên có rất nhiều đồ ăn ngon, ta nhất định sẽ thích..." Giọng nàng mang theo vài phần hoài niệm ngọt ngào, đuôi cáo cũng không tự chủ được mà vẫy lên. Nhìn bộ dạng đắm chìm trong hồi ức của nàng, trong lòng ngươi chua xót đến mức gần như muốn tràn ra ngoài. "Sau đó thì sao?" Giọng ngươi có chút cứng nhắc. "Sau đó Hoài Viễn phải về Trung Nguyên, đến Trường An xin viện binh." Giọng nàng trầm xuống, "Trước khi đi, ta đem miếng ngọc bội tùy thân tặng cho Hoài Viễn, để Hoài Viễn... để Hoài Viễn nhớ quay lại."|Cơ Tự|Sơn đạo|U sầu|none

Ngọc bội? Tín vật định tình? Lòng ngươi chùng xuống. Hóa ra là vậy... Hóa ra trong lòng đại sư tỷ luôn có một người, một người nàng đã chờ đợi hơn một trăm năm. Ngươi nỗ lực giữ cho biểu cảm trên mặt bình tĩnh, nhưng nắm tay siết chặt đã bán đứng tâm tình của bạn. "Hoài Viễn nói nhất định sẽ quay lại." Giọng Cơ Tự ngày càng nhẹ, "Nói đợi mang viện quân quay về, liền..." Nàng đột nhiên dừng lại, không nói tiếp nữa. "Liền làm sao?" Ngươi truy hỏi, giọng mang theo một sự gấp gáp mà chính mình cũng không nhận ra. Cơ Tự lắc đầu: "Không có gì. Đều là chuyện cũ năm xưa rồi."|Cơ Tự|Sơn đạo|U sầu|none

Ngươi im lặng đi theo sau nàng, trong đầu không ngừng vang vọng những lời nàng vừa nói —— "Tiểu hồ ly", "Đuôi xù xì", "Cùng đi Trung Nguyên", "Ngọc bội"... Mỗi một câu đều như đang nói cho ngươi biết, trong lòng nàng từ sớm đã có một người rồi. Ngươi hít sâu một hơi, nỗ lực đè xuống cảm xúc đang cuộn trào trong lòng. "Đại sư tỷ," Ngươi lên tiếng, giọng cố gắng bình tĩnh nhất có thể, "Chu Hoài Viễn đó... chắc chắn là một người rất tốt nhỉ." "Ừm." Nàng gật đầu, đôi mắt màu hổ phách tràn đầy nhu tình.|Cơ Tự|Sơn đạo|Mỉm cười|none

Buổi chiều, các ngươi đến thôn Bostan. Đây là một làng chài yên tĩnh được xây dựng bên hồ, nước hồ xanh biếc như gương, lau sậy đung đưa theo gió. Vọng Nguyệt trà lâu nằm ngay cạnh hồ, là một tòa lầu hai tầng, việc kinh doanh không mặn không nhạt. Cơ Tự đứng trước cửa trà lâu rất lâu, tai cáo lo lắng run rẩy. Nhìn bộ dạng lo sợ được mất đó của nàng, ngươi không biết nói gì, chỉ có thể im lặng ở bên cạnh nàng. Nàng hít sâu một hơi, đẩy cửa bước vào.|Cơ Tự|Tửu quán|Căng thẳng|none
</MAIN_TEXT>

<SUMMARY>
Trên đường đến thôn Bostan, Cơ Tự ngân nga bài đồng dao Chu Hoài Viễn dạy nàng, kể lại chuyện cũ —— Chu Hoài Viễn là người duy nhất chủ động tiếp cận nàng, dạy nàng nói viết, gọi nàng là "Tiểu hồ ly", còn nói đuôi xù xì sờ rất thích. Nàng tặng ngọc bội cho Chu Hoài Viễn làm tín vật, hẹn ngày gặp lại. Nghe những chuyện cũ thân mật này, lòng ngươi dâng lên niềm chua xót mãnh liệt, nhưng chỉ có thể im lặng kề bên. Khi đến trà lâu, Cơ Tự căng thẳng đến mức tai cáo run rẩy.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Cơ Tự kể lại chuyện cũ với Chu Hoài Viễn —— những cách gọi thân mật, ngọc bội định tình, lời hẹn ước chưa thành. Lòng ngươi chua xót, nhưng chỉ có thể im lặng bầu bạn.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "14:00",
    "Người chơi": {
        "Thay đổi vị trí": "Tửu quán"
    },
    "NPC hiện tại": {
        "Cơ Tự": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Tửu quán"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    {
        id: "Jisi_Letter_3",
        name: "Di thư người cũ · Cơ Tự 3",
        priority: 78,
        conditions: {
            currentSpecialEvent: { equals: 'Jisi_Letter_2' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Trong trà lâu không nhiều người lắm, vài ba tốp khách trà đang tán gẫu. Các ngươi chọn một vị trí cạnh cửa sổ ngồi xuống, gọi một ấm trà, bắt đầu chờ đợi. Cơ Tự đứng ngồi không yên, chốc chốc lại uống trà, chốc chốc nhìn ra ngoài cửa sổ, chốc chốc lại vuốt lại tóc. Ngươi chưa bao giờ thấy nàng lo lắng như vậy —— vị đại sư tỷ ngày thường vô tư lự, hay nói hay cười kia, lúc này lại giống như một thiếu nữ sắp sửa gặp được ý trung nhân. Lòng ngươi càng thêm chua xót, nhưng chỉ có thể im lặng bầu bạn với nàng.|Cơ Tự|Tửu quán|Căng thẳng|none

Vừa lúc đó, cửa trà lâu được đẩy ra. Một nữ tử trẻ tuổi bước vào, chừng ngoài hai mươi tuổi, mặc thanh y tố tịnh, dung mạo thanh tú, khí chất ôn nhu. Ánh mắt nàng đảo quanh trà lâu một vòng, cuối cùng dừng lại trên đôi tai cáo màu bạc của Cơ Tự, ánh mắt lập tức sáng bừng lên. "Xin hỏi... ngài có phải là Cơ Tự tiền bối không?" Nàng rảo bước đi tới, giọng nói khẽ run rẩy, "Vãn bối Chu Thanh Uyển, đặc biệt đến bái kiến tiền bối!" Cơ Tự đứng dậy, ánh mắt dừng trên khuôn mặt nàng, ngẩn người xuất thần.|Cơ Tự|Tửu quán|Kinh ngạc|none

"Ngươi..." Giọng Cơ Tự có chút phát run, "Ngươi trông... rất giống..." "Gia phụ cũng từng nói như vậy," Chu Thanh Uyển mỉm cười, vành mắt lại khẽ đỏ lên, "Người nói đôi lông mày và ánh mắt của vãn bối rất giống tổ thượng lúc còn trẻ." Nàng từ trong lòng lấy ra một bọc vải, hai tay nâng lên đưa cho Cơ Tự, "Đây là di vật tổ thượng để lại, gia phụ dặn đi dặn lại, nhất định phải tận tay giao cho ngài." Cơ Tự run rẩy đưa hai tay nhận lấy bọc vải, cẩn thận từng li từng tí mở ra —— bên trong là một miếng ngọc bội và một bức thư đã ố vàng.|Cơ Tự|Tửu quán|Kinh ngạc|none

"Miếng ngọc bội này..." Giọng Cơ Tự nghẹn ngào. Ngươi ghé sát lại xem —— đó là một miếng bạch ngọc bội điêu khắc hình bông Tuyết Liên, tay nghề tinh tế, toàn thân ấm áp trơn bóng, rõ ràng đã được người ta đeo sát người rất nhiều năm. "Tăng tổ mẫu nói, đây là ngài tặng cho người." Chu Thanh Uyển khẽ nói. "Tăng tổ mẫu luôn đeo trên người, chưa bao giờ tháo xuống. Trước lúc lâm chung, người bảo gia phụ chuyển giao cho ngài, nói... nói là vật về chủ cũ."|Cơ Tự|Tửu quán|U sầu|none

Cơ Tự nâng miếng ngọc bội, đôi tai cáo bạc run rẩy dữ dội, vành mắt đã đỏ hoe. Nàng dường như hoàn toàn không chú ý đến sự chấn kinh của bạn, chỉ lẩm bẩm tự nhủ: "Hoài Viễn... sư tỷ..." Tăng tổ mẫu?! Sư tỷ?! Não ngươi vận hành thần tốc —— vậy nên Chu Hoài Viễn không phải là người tình của Cơ Tự, mà là sư tỷ của nàng?!|Cơ Tự|Tửu quán|U sầu|none

"Còn bức thư này nữa," Chu Thanh Uyển tiếp tục nói, "Là chính tay tăng tổ mẫu viết trước khi lâm chung. Người nói... chỉ có Cơ Tự tiền bối mới có thể mở thư." Cơ Tự mở bức thư ra, ngươi thấy nét chữ lúc đầu còn coi như ngay ngắn, càng về sau càng run rẩy nguệch ngoạc, rõ ràng là vào lúc lâm chung đã dốc hết sức tàn để viết.|Cơ Tự|Tửu quán|U sầu|none

</MAIN_TEXT>

<SUMMARY>
Chu Thanh Uyển mang đến di vật của tổ thượng Chu Hoài Viễn —— miếng ngọc bội Cơ Tự tặng năm đó và một bức mật thư tuyệt bút. Trong thư Chu Hoài Viễn tự xưng là "ngu tỷ", gọi Cơ Tự là "ngô muội". Đến lúc này ngươi mới bừng tỉnh đại ngộ: Chu Hoài Viễn là nữ giới, là sư tỷ của Cơ Tự, hai người là tình cảm tỷ muội chứ không phải người tình.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Sự thật phơi bày —— Chu Hoài Viễn là nữ giới, là sư tỷ của Cơ Tự. Cơ Tự mở bức thư của Chu Hoài Viễn và bắt đầu đọc.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "15:00",
    "Người chơi": {
        "Thay đổi vị trí": "Tửu quán"
    },
    "NPC hiện tại": {
        "Cơ Tự": {
            "Thay đổi hảo cảm": "Tăng lên",
            "Thay đổi vị trí": "Tửu quán"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    {
        id: "Jisi_Letter_4",
        name: "Di thư người cũ · Cơ Tự 4",
        priority: 77,
        conditions: {
            currentSpecialEvent: { equals: 'Jisi_Letter_3' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
"Cơ Tự ngô muội, kiến tín như ngộ (thấy thư như thấy người): Ngu tỷ cả đời này điều tiếc nuối nhất chính là không thể quay lại Thiên Sơn nhìn muội lấy một lần. Năm xưa từ biệt, vốn tưởng rằng đợi đến khi triều đình phái binh thu phục Hà Tây sẽ có ngày gặp lại muội. Ngờ đâu thế sự vô thường, ngu tỷ vừa đi lần này lại là vĩnh quyết."|Cơ Tự|Tửu quán|Cảnh đặc tả 1|none

"Năm đó ngu tỷ một đường đi về hướng Đông, trải qua muôn vàn gian khổ mới đến được Trường An, mới phát hiện Đại Đường Thiên tử từ sớm đã tự thân khó bảo toàn. Lưu khấu hoành hành, tông thất chịu nhục, triều đình trên dưới đều hoang mang lo sợ, ai còn bận tâm đến vùng đất cũ Hà Tây cách xa vạn dặm nữa chứ? Ngu tỷ quỳ trước cửa cung ba ngày ba đêm, ngay cả một lời đáp phục cũng chưa từng nhận được."|Cơ Tự|Tửu quán|Cảnh đặc tả 1|none

"Sau đó chính là loạn thế. Ngu tỷ đi khắp một nửa thiên hạ, hễ nơi nào có binh mã đều đến cầu viện. Hoài Nam, Hà Đông, Hà Bắc, Thục Trung... Những tiết độ sứ đó kẻ nào kẻ nấy đều ủng binh tự trọng, nghe đến hai chữ Hà Tây là đùn đẩy né tránh, ai nguyện ý phân binh vạn dặm để đánh thông Lũng Hữu? Có kẻ thì lấy lệ qua loa, có kẻ đóng cửa không tiếp, thậm chí có kẻ còn âm thầm cười nhạo —— 'Nơi biên thùy hoang mạc xa xôi cách đây mấy ngàn dặm thì có can hệ gì đến ta?'"|Cơ Tự|Tửu quán|Cảnh đặc tả 2|none

"Ngu tỷ đi khắp nơi bôn ba hơn hai mươi năm, đã mòn rách bao nhiêu đôi giày, xem thấu bao nhiêu ánh mắt lạnh lùng, cuối cùng vẫn là một việc chẳng thành. Đến sau này, Hồ trần cách tuyệt, núi cao nước xa, ngu tỷ dù có muốn quay lại Thiên Sơn cũng không thể làm được nữa rồi."|Cơ Tự|Tửu quán|Cảnh đặc tả 2|none

"Mỗi lần nghĩ đến chư vị ở Thiên Sơn phái, nghĩ đến muội, ngu tỷ lại hổ thẹn khôn cùng. Năm xưa lời thề son sắt nói sẽ mang viện quân quay về, giờ xem ra chỉ là si nhân thuyết mộng. Ngu tỷ phụ lòng trọng thác của sư môn, phụ lòng phó thác của Trương công, càng phụ lòng ánh mắt mong chờ tha thiết của muội. Những năm qua muội một mình thủ ở Thiên Sơn, có từng oán hận ngu tỷ không?"|Cơ Tự|Tửu quán|Cảnh đặc tả 2|none

"Ngu tỷ hiện giờ đã là người sắp chết, e là không còn đi nổi nữa rồi. Thiên hạ tịch liêu sự (chuyện tịch liêu chốn thiên hạ), dữ quân quát biệt thời (là lúc từ biệt người quân tử), ngu tỷ thường mơ thấy tuyết ở Thiên Sơn, mơ thấy muội cười rồi chạy về phía tỷ, tỉnh lại chỉ có xà nhà trống rỗng và ánh trăng ngoài cửa sổ."|Cơ Tự|Tửu quán|Cảnh đặc tả 3|none

Thư viết đến đây, nét chữ đã xiêu xiêu vẹo vẹo, gần như khó lòng nhận ra nổi. Mấy dòng cuối cùng như thể đã dùng hết toàn bộ sức lực của cơ thể: "Kèm theo thư là cây trâm của ngu tỷ, là cây trâm khi xưa rời khỏi Thiên Sơn đã cài trên đầu. Ngu tỷ to gan, cầu muội một việc —— Nếu có cơ hội, hãy chôn cây trâm này ở núi sau Thiên Sơn phái, bất cứ góc nào cũng được. Ngu tỷ cả đời này đã đi đoạn đường quá xa quá xa rồi, mệt rồi, muốn về nhà rồi."|Cơ Tự|Tửu quán|Cảnh đặc tả 3|none

"Ngô muội, chớ vì ngu tỷ mà đau lòng quá lâu, hãy thay ngu tỷ sống thật tốt, thay ngu tỷ ngắm nhìn hoa xuân trăng thu của nhân gian này. Nếu kiếp sau có duyên, ngu tỷ nhất định sẽ không đi xa như vậy nữa, sẽ ở Thiên Sơn bầu bạn bên muội, đi đâu cũng chẳng đi nữa."|Cơ Tự|Tửu quán|Cảnh đặc tả 3|none

Cuối thư viết nguệch ngoạc: "Ngu tỷ Hoài Viễn tuyệt bút." Chỗ ký tên có mấy giọt nước vệt nước đã khô —— là vết nước mắt hay là vết mực, đã không còn phân biệt rõ nữa.|Cơ Tự|Tửu quán|Cảnh đặc tả 3|none
</MAIN_TEXT>

<SUMMARY>
Bức thư tuyệt bút của Chu Hoài Viễn đã nói hết nỗi tiếc nuối và hổ thẹn cả đời nàng. Năm đó nàng đi về hướng Đông cầu viện, cuối cùng lại phí hoài cả đời, trong thư nàng tự trách vì đã phụ lòng sư môn, càng phụ lòng Cơ Tự, điều đáng tiếc nhất cả đời này chính là không thể gặp lại Cơ Tự thêm một lần. Cuối thư nàng cầu xin Cơ Tự hãy chôn cây trâm đi kèm ở núi sau Thiên Sơn phái, để linh hồn nàng được trở về cố hương.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Bức thư tuyệt bút của Chu Hoài Viễn đã nói hết nỗi tiếc nuối và hổ thẹn cả đời nàng. Năm đó nàng đi về hướng Đông cầu viện, cuối cùng lại phí hoài cả đời, trong thư nàng tự trách vì đã phụ lòng sư môn, càng phụ lòng Cơ Tự, điều đáng tiếc nhất cả đời này chính là không thể gặp lại Cơ Tự thêm một lần. Cuối thư nàng cầu xin Cơ Tự hãy chôn cây trâm đi kèm ở núi sau Thiên Sơn phái, để linh hồn nàng được trở về cố hương.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "17:30",
    "Người chơi": {
        "Thay đổi vị trí": "Tửu quán"
    },
    "NPC hiện tại": {
        "Cơ Tự": {
            "Thay đổi hảo cảm": "Tăng lên",
            "Thay đổi vị trí": "Tửu quán"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    {
        id: "Jisi_Letter_5",
        name: "Di thư người cũ · Cơ Tự 5",
        priority: 76,
        conditions: {
            currentSpecialEvent: { equals: 'Jisi_Letter_4' }
        },
        effects: {
            GameMode: { set: 0 },
            inputEnable: { set: 1 },
            mapLocation: { set: 'Thiên Sơn phái' },
            companionNPC: { set: [] },
            userLocation: { set: 'tianshanpai' }
        },
        text: `< SLG_MODE >

<MAIN_TEXT>
Sáng sớm ngày thứ hai, ngươi và Cơ Tự chia tay Chu Thanh Uyển tại đầu thôn. "Tiền bối," Chu Thanh Uyển cúi đầu thật sâu, "Tâm nguyện của tổ thượng cuối cùng cũng đã hoàn tất. Sau này nếu có cơ hội, vãn bối nhất định sẽ lên Thiên Sơn phái bái phỏng." "Được." Cơ Tự gật gật đầu, đôi mắt màu hổ phách mang theo mấy phần thoải mái, "Trên đường cẩn thận, nếu có khó khăn, lúc nào cũng có thể tìm đến ta." Chu Thanh Uyển vành mắt khẽ đỏ, nhìn Cơ Tự một lần cuối cùng rồi lên xe ngựa, dần dần biến mất trong sương sớm.

Trên đường quay về, Cơ Tự vẫn im lặng không nói lời nào. Tay nàng siết chặt lấy cây trâm và miếng ngọc bội trong lòng, đôi tai cáo chốc chốc lại rung lên một cái, dường như đang suy nghĩ điều gì. Ngươi không làm phiền nàng, chỉ lẳng lặng ở bên cạnh bầu bạn. Đến buổi chiều, cuối cùng các ngươi cũng quay lại Thiên Sơn phái. Cơ Tự không quay về phòng nữ đệ tử, mà đi thẳng về phía núi sau.

Sau núi có một bãi cỏ sườn núi yên tĩnh, mọc đầy hoa dại, có thể bao quát toàn bộ Thiên Sơn phái. Cơ Tự dừng bước trên sườn núi, nhìn quanh bốn phía, cuối cùng chọn một vị trí dưới gốc thông. "Ở đây đi." Nàng khẽ nói, "Sư tỷ sinh tiền thích nhất là lên cao nhìn xa... Ở đây có thể nhìn thấy toàn bộ môn phái, tỷ ấy chắc chắn sẽ thích." Ngươi gật gật đầu, lẳng lặng giúp nàng đào đất. Cơ Tự ngồi xổm bên cạnh, đặt miếng ngọc bội và cây trâm sóng vai trong lòng bàn tay, ngẩn người nhìn rất lâu.

"Sư tỷ," Nàng khẽ nói, giọng nói có chút khàn khàn, "Muội đưa tỷ về nhà rồi." Nàng từ trong lòng lấy ra một chiếc khăn tay trắng, cẩn thận bọc miếng ngọc bội và cây trâm lại bằng khăn trắng, đặt vào hố đất. "Đây là chiếc khăn năm đó muội tự tay thêu... thêu rất xấu, sư tỷ lại nói đẹp..." Giọng nàng ngày càng thấp, tai cáo rũ xuống, cái đuôi cáo bạc quấn chặt lấy bản thân. Ngươi lẳng lặng giúp nàng lấp đất lại, đắp thành một nấm mồ nhỏ.

Cơ Tự quỳ trước mộ, trang trọng dập đầu ba cái. "Sư tỷ," Giọng nàng mang theo tiếng khóc nghẹn, "Tỷ đã đi một trăm hai mươi ba năm... cuối cùng đã về nhà rồi." Nước mắt trượt theo gò má nàng rơi xuống, thấm vào lớp đất mới vừa lật. "Muội đã không đợi được đến lúc tỷ quay về... nhưng muội sẽ thay tỷ trông coi Thiên Sơn phái..." Bờ vai nàng khẽ run rẩy, nhưng không khóc thành tiếng. Ngươi ngồi xổm bên cạnh nàng, khẽ vỗ về sau lưng nàng, không nói gì cả.

Hồi lâu sau, Cơ Tự cuối cùng cũng ngừng khóc. Nàng dùng ống tay áo quệt bừa lên mặt, hít sâu một hơi rồi đứng dậy. "Được rồi," Giọng nàng vẫn còn chút khàn khàn, nhưng ngữ điệu đã bình tĩnh hơn nhiều, "Chuyện của sư tỷ... rốt cuộc cũng coi như hoàn tất." Nàng quay đầu lại, đôi mắt màu hổ phách nhìn ngươi, vành mắt vẫn còn đỏ nhưng lại nặn ra một nụ cười, "Cảm ơn đệ... đã bầu bạn cùng ta làm xong những việc này." "Đại sư tỷ, tỷ không cần cảm ơn đệ." Ngươi nghiêm túc nói, "Đây là việc đệ nên làm."

"Phải rồi," Cơ Tự đột nhiên nghiêng đầu, "Ta có chuyện muốn hỏi đệ." "Chuyện gì ạ?" "Hôm qua ở trà lâu..." Khóe môi nàng cong lên một độ cong nhỏ đầy tinh quái, "Có phải đệ tưởng Hoài Viễn là... hửm của ta không?" Mặt bạn lập tức đỏ bừng: "Đệ, đệ không có ——" "Lừa người," Nàng ghé sát lại gần bạn, "Chả trách suốt đoạn đường đệ đều chua lòm lòm, ta đâu có mù. Thừa nhận đi, đệ ghen rồi."

"Đệ..." Ngươi há hốc mồm, không biết nên giải thích thế nào. Nhìn bộ dạng quẫn bách của bạn, Cơ Tự không nhịn được cười khúc khích, tiếng cười đó trong trẻo êm tai, xua tan đi bầu không khí u thương. "Được rồi được rồi, không trêu đệ nữa." Nàng vỗ vỗ vai bạn, đuôi cáo cũng theo đó mà vẫy lên vui vẻ, "Thực ra ta rất vui." "Vui ạ?" "Vui vì đệ sẽ ghen đấy," Giọng nàng nhẹ lại, đỉnh tai hơi ửng hồng, "Nghĩa là... đệ quan tâm đến ta mà."

Ngươi ngẩn người tại chỗ, nhịp tim không tự chủ được mà đập nhanh hơn. Cơ Tự quay mặt đi chỗ khác, giả vờ nhìn về phía ngọn núi xa xa, nhưng bạn vẫn thấy tai nàng đỏ bừng dữ dội. "Sư tỷ đã đi hơn một trăm năm... Ta một mình chờ đợi hơn một trăm năm..." Giọng nàng phiêu hốt, "Đôi khi ta sẽ nghĩ, có phải cả đời này ta chỉ có thể cô độc một mình không..." Nàng khựng lại một chút, tai cáo rung lên một cái, "Nhưng bây giờ, tuy sư tỷ không còn nữa," Nàng hướng nhìn môn phái dưới chân núi, ngữ khí đầy thoải mái, "Nhưng ta còn có Thiên Sơn phái, còn có con nhỏ Tiêu Bạch Hồ đó, còn có Vũ Chúc..." Nàng lén liếc nhìn ngươi một cái, "Còn có đệ nữa."

"Đi!" Nàng nắm lấy tay bạn lôi đi, chạy xuống núi, "Ta đói rồi! Chúng ta đi ăn một bữa thật ngon đi! Ta mời khách!" "Đại sư tỷ, tỷ đi chậm thôi ——" "Chậm cái gì mà chậm!" Nàng quay đầu lại, tai cáo vẫy vùng vui sướng, "Ta muốn ăn đùi cừu nướng, thịt kho tàu, canh gà hầm, cá sốt chua ngọt... Đúng rồi, còn có hạt dẻ rang đường nữa!" Ngươi bị nàng kéo đi lảo đảo, nhưng không nhịn được mà bật cười theo ——

Buổi tối, ngươi và Cơ Tự ngồi trong xó của hỏa phòng, trước mặt bày đầy đủ loại thức nướng và món ăn. Cơ Tự ăn đến mức mặt mày rạng rỡ, hai má căng phồng, đuôi cáo vẫy như một cái trống lắc. Nhìn bộ dạng vô tư lự đó của nàng, trong lòng ngươi dâng lên một luồng hơi ấm. "Đại sư tỷ," Ngươi không nhịn được lên tiếng, "Đệ có chuyện muốn nói với tỷ." "Hửm?" Miệng nàng ngập đầy thịt, ú ớ đáp lời, "Chuyện gì?"

"Sư tỷ Chu Hoài Viễn..." Ngươi nghiêm túc nhìn nàng, "Tỷ ấy từng nói sẽ dẫn tỷ đi Trung Nguyên, ngắm hoa đào, ăn bánh ngọt quê hương." Động tác của Cơ Tự khựng lại một chút, đôi mắt màu hổ phách thoáng qua một tia hoài niệm. "Lời hẹn ước mà tỷ ấy chưa thể hoàn thành," Ngươi hít sâu một hơi, "Sau này... sau này sẽ do đệ đến hoàn thành." Cơ Tự ngẩn người, đôi đũa dừng lại giữa không trung, ngây người nhìn ngươi. "Đợi thiên hạ thái bình rồi," Ngươi nói, "Đệ sẽ đưa tỷ đi Trung Nguyên, đến quê hương của sư tỷ Chu xem thử."

"Đệ..." Giọng Cơ Tự có chút phát run, đôi tai cáo rung lên dữ dội, "Đệ nói thật sao?" "Thật." Ngươi gật gật đầu, "Đệ nói được là làm được." Cơ Tự cúi đầu, mái tóc bạc dài rũ xuống che đi biểu cảm. Ngươi thấy bờ vai nàng đang khẽ run rẩy. "Đệ... cái miệng này của đệ, từ bao giờ trở nên dẻo kẹo như vậy rồi..." Giọng nàng nghèn nghẹn mang theo tiếng khóc, "Chỉ toàn nói mấy lời... không ra đâu vào đâu..." Nàng ngẩng đầu lên, vành mắt đỏ đỏ nhưng nụ cười lại rạng rỡ hơn bao giờ hết.

"Được..." Nàng dùng sức gật đầu, nước mắt và nụ cười hòa quyện vào nhau, "Vậy ta liền... liền chờ đệ dẫn ta đi..." Giọng nàng ngày càng nhỏ, đôi má cũng ngày càng đỏ. Đột nhiên, nàng đứng phắt dậy, đi vòng qua bàn đến trước mặt bạn. Chưa đợi bạn kịp phản ứng, nàng đã nhón chân lên, in một nụ hôn thật nhanh lên gò má bạn —— cảm giác chạm vào mềm mại ấm áp, mang theo hương vị nhàn nhạt của món thịt. "Đây là... đây là tiền đặt cọc!"

Lời còn chưa dứt, nàng đã xoay người bỏ chạy, cái đuôi cáo bạc loạn xạ lắc lư phía sau, suýt chút nữa làm lật cái ghế bên cạnh. "Đại sư tỷ! Thức ăn của tỷ còn chưa ăn xong ——" "Khô, không ăn nữa! Ta đột nhiên nhớ ra còn có việc!" Giọng nàng vọng lại từ ngoài cửa mang theo sự run rẩy, "Mà, mai gặp lại nhé!" Ngươi ngây người ngồi tại chỗ, tay sờ lên gò má vừa bị hôn. Trong hỏa phòng chỉ còn lại một mình bạn và bàn đầy thức thức ăn. An Mộ từ trong bếp ngó đầu ra, nhìn nhìn cái ghế trống không, lại nhìn nhìn biểu cảm cười đần độn của bạn, mặt đầy vẻ khó hiểu: "...Xảy ra chuyện gì rồi?"
</MAIN_TEXT>

<SUMMARY>
Sau khi tiễn biệt Chu Thanh Uyển, ngươi và Cơ Tự quay về Thiên Sơn phái, tại núi sau lập một mộ quần áo di vật cho Chu Hoài Viễn, chôn xuống cây trâm, ngọc bội và chiếc khăn tay trắng năm xưa Cơ Tự tự tay thêu. Cơ Tự dập đầu bái biệt trước mộ, cuối cùng đã hoàn tất tâm nguyện trăm năm. Sau đó nàng khôi phục tinh thần, trêu chọc bộ dạng ghen tuông của bạn suốt đoạn đường, thản nhiên nói "rất vui vì đệ quan tâm đến ta". Nàng cảm thán tuy cố nhân đã đi nhưng còn có Thiên Sơn phái, Tiêu Bạch Hồ, Vũ Chúc và ngươi là những người thân mới, quyết định sẽ xốc lại tinh thần. Ngươi hứa sẽ thay Chu Hoài Viễn hoàn thành lời hẹn đưa nàng đi Trung Nguyên, Cơ Tự cảm động rơi lệ, hôn nhanh lên mặt bạn một cái nói là "tiền đặt cọc" rồi thẹn thùng bỏ chạy mất hút.
</SUMMARY>

<SIDE_NOTE>
{
    "Thời gian": "18:00",
    "Người chơi": {
        "Thay đổi vị trí": "không có"
    },
    "NPC hiện tại": {
        "Cơ Tự": {
            "Thay đổi hảo cảm": "Tăng mạnh",
            "Thay đổi vị trí": "Phòng nữ đệ tử"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    {
        id: "QTJ_Festival_1",
        name: "Đản thần Cửu Thiên Huyền Nữ 1 - Ước hẹn cùng bạn thân",
        priority: 70,
        conditions: {
            currentWeek: { min: 1 },
            "npcFavorability.C": { min: 30 }
        },
        effects: {
            GameMode: { set: 1 },
            inputEnable: { set: 0 },
            mapLocation: { set: 'Thiên Sơn phái ngoại bảo' },
            companionNPC: { push: 'Tiền Đường Quân' }
        },
        text: `< SLG_MODE >

<MAIN_TEXT>
Một tuần mới, vào một buổi chiều tối nọ, ngươi vừa luyện công xong ở diễn võ trường về, mồ hôi nhễ nhại, đang tính bụng đi hỏa phòng trộm chút gì đó lót dạ. Còn chưa đi được mấy bước, một bóng người quen thuộc đã từ góc tường lao ra, cái đuôi rồng màu bạc suýt chút nữa quất vào mặt bạn. "Này!" Tiền Đường Quân chống nạnh, đôi đồng tử dựng đứng màu đỏ rực lóe lên sự xảo quyệt, "Nhóc con nhà ngươi trốn ở đâu thế? Bản rồng tìm ngươi nửa ngày!"|Tiền Đường Quân|Diễn võ trường|Hứng khởi|none

"Ta có thể trốn đi đâu chứ?" Ngươi không kiêng nể mà gạt cái đầu đang ghé sát lại của nàng ra, "Luyện công chứ sao, không giống như con rồng lười nào đó, ngày nào cũng trốn học." "Xì, đó gọi là lao dật kết hợp (làm việc và nghỉ ngơi hợp lý), hiểu không?" Tiền Đường Quân hoàn toàn không biết xấu hổ, ngược lại còn đắc ý lắc lắc đôi sừng rồng đỏ rực bên thái dương, "Thôi thôi, đừng nói nhảm nữa —— Hậu thiên là đản thần của Cửu Thiên Huyền Nữ, ngoại bảo sẽ tổ chức hội chợ, ngươi biết chứ?" Ngươi đương nhiên biết. Hàng năm vào thời gian này, ngoại bảo đều náo nhiệt suốt mấy ngày, diễn kịch, múa tạp kỹ, các loại sạp hàng đồ ăn, đó là khoảng thời gian vui vẻ hiếm hoi trong năm của những người lánh nạn. Những năm trước các ngươi đều kết bạn xuống núi đi quấy phá, ăn hết gian hàng này đến gian hàng khác, sẵn tiện trêu chọc vài kẻ xui xẻo giữa đám đông.|Tiền Đường Quân|Diễn võ trường|Đắc ý|none

"Biết chứ, sao vậy?" Ngươi cảnh giác lùi lại một bước. Mỗi lần Tiền Đường Quân nói bằng giọng điệu này, chắc chắn không có chuyện gì tốt. Quả nhiên, nàng một tay khoác lấy cổ bạn, hạ thấp giọng: "Bản rồng đã xin chị nghỉ sớm rồi, hậu thiên hai chúng ta cùng xuống núi xem hát đi! Đoàn kịch năm nay diễn vở 《Cửu Thiên Huyền Nữ thụ Thiên thư》, nghe nói mời danh giác từ Y Châu đến, cực kỳ đặc sắc!" Ngươi thầm nghĩ: "Lại nữa rồi, năm nào cũng bài này, lôi kéo ta xuống ngoại bảo quấy phá, hễ có chuyện gì là lại đẩy ta ra chịu trận..."|Tiền Đường Quân|Diễn võ trường|Hứng khởi|none

Miệng thì lại nói: "Được thôi, giờ nào?" "Giờ Dậu khắc một, gặp nhau ở cổng núi! Ai đến muộn kẻ đó là chó!" Tiền Đường Quân vỗ vỗ vai bạn, giọng điệu đột nhiên trở nên nghiêm chỉnh lạ thường, "Đúng rồi, kịch năm nay thực sự rất đặc biệt, ngươi nhất định phải đến đấy." "Đặc biệt? Đặc biệt thế nào?" "Oa ha ha ha, đến lúc đó ngươi sẽ biết thôi!" Nàng cười đầy vẻ thần bí, đuôi rồng đắc ý ngoáy qua ngoáy lại, rồi chạy biến đi mất hút.|Tiền Đường Quân|Diễn võ trường|Cười lớn|none

Nhìn theo bóng lưng nàng, ngươi luôn thấy có gì đó không đúng. Cái con nhỏ này bình thường rủ ngươi đi chơi, bao giờ cũng trực tiếp lôi kéo đi luôn, làm gì có chuyện thông báo trước hai ngày thế này? Vừa nãy câu "Rất đặc biệt", trong ánh mắt nàng dường như thoáng qua một chút... căng thẳng? Thôi bận tâm chi, không hiểu nổi. Ngươi lắc đầu, xoay người đi hỏa phòng tìm đồ ăn. Ngươi thầm nghĩ: "Kệ nàng đi, dù sao hậu thiên đi là biết ngay. Chắc chắn lại là ý định xấu gì của nàng đang ấp ủ, đến lúc đó tùy cơ ứng biến là được."|none|Diễn võ trường|none|none

Hai ngày sau, giờ Dậu khắc một. Ánh hoàng hôn nhuộm trời xanh thành màu vàng cam, ngươi từ sớm đã đứng ở cổng núi. Gió đêm mang theo cái lạnh của núi rừng, thổi qua khiến tinh thần sảng khoái hẳn lên. Chờ một khắc đồng hồ, Tiền Đường Quân không thấy đến. Chờ hai khắc đồng hồ, vẫn không thấy đến. "Con rồng thối này..." Ngươi lầm bầm mắng, "Đã nói ai đến muộn kẻ đó là chó, kết quả chính mình lại làm chó trước."|none|Sơn môn|none|none

Đã chờ gần nửa canh giờ, ngươi thực sự không thể chờ thêm được nữa, quyết định trước tiên đi phòng nữ đệ tử tìm nàng. Kết quả vừa đi đến cửa, liền bị một nữ đệ tử ngoại môn đi ngang qua chặn lại. "Sư huynh tìm ai vậy?" "Tiền Đường Quân, nàng ấy có ở đây không?" "Tiền Đường sư tỷ à," Nữ đệ tử đó chớp chớp mắt, "Tỷ ấy buổi chiều đã xuống núi rồi, nói là đến ngoại bảo có việc gấp, dặn ta nếu gặp huynh thì nhắn lại một tiếng —— bảo huynh cứ xuống trước đi, tỷ ấy ở ngoại bảo đợi huynh."|none|Phòng nữ đệ tử|none|none

Ngươi ngẩn người tại chỗ. Chuyện gì thế này? Đã hẹn cùng đi, kết quả nàng lại tự mình chạy trước? Trong lòng ngươi dâng lên một luồng lửa giận vô danh, nhưng càng nhiều hơn là sự hoang mang. Tiền Đường Quân cái con nhỏ này tuy không có nề nếp gì, nhưng từ nhỏ đến lớn, duy chỉ có chuyện chơi bời là không bao giờ cho ngươi leo cây. Hôm nay là bị làm sao vậy? "Thôi bỏ đi..." Ngươi thở dài một hơi, "Đến ngoại bảo tìm nàng hỏi cho ra lẽ." Mặt trời đã lặn hẳn, phía chân trời chỉ còn sót lại một vệt hoàng hôn cuối cùng. Ngươi một mình bước ra khỏi cổng núi, dọc theo con đường nhỏ trong thung lũng đi về phía ngoại bảo.|none|Sơn đạo|none|none
</MAIN_TEXT>

<SUMMARY>
Một tuần mới, hai ngày trước đản thần của Cửu Thiên Huyền Nữ, Tiền Đường Quân hẹn ngươi cùng đến ngoại bảo xem hát kịch, thần thần bí bí nói kịch năm nay "rất đặc biệt". Đúng giờ Dậu khắc ba ngày hôm đó ngươi theo hẹn đến cổng núi chờ nàng, nhưng lại nhận được lời nhắn của một nữ đệ tử ngoại môn —— Tiền Đường Quân đã xuống núi trước rồi, bảo ngươi tự mình đến ngoại bảo tìm nàng. Ngươi đầy bụng nghi ngờ, một mình dấn bước lên con đường dẫn đến ngoại bảo.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Tiền Đường Quân lỡ hẹn, một mình xuống núi trước. Ngươi quyết định đi đến ngoại bảo để tìm hiểu rõ ngọn ngành.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "18:30",
    "Người chơi": {
        "Thay đổi vị trí": "Sơn đạo"
    },
    "NPC hiện tại": {
        "Tiền Đường Quân": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "không có"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    // ==================== 第二段：庙会盛景 ====================
    {
        id: "QTJ_Festival_2",
        name: "Đản thần Cửu Thiên Huyền Nữ 2 - Thịnh cảnh hội chợ",
        priority: 69,
        conditions: {
            currentSpecialEvent: { equals: 'QTJ_Festival_1' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Băng qua thung lũng, cảnh tượng ở ngoại bảo khiến ngươi ngẩn người một lát. Bóng tối bao trùm, nhưng trong lòng chảo nhỏ này lại đèn đuốc sáng trưng, rực rỡ như ban ngày. Những chiếc đèn lồng treo đầy hai bên chợ, đỏ, vàng, đủ loại màu sắc chiếu sáng cả con phố. Tiếng người ồn ào náo nhiệt, so với bất kỳ kỳ hội chợ nào trong năm trước đều sôi động hơn. Trẻ em cầm kẹo đường chạy tới chạy lui, người già tụ tập thành từng nhóm đi về phía sân khấu hát kịch, trong không khí phảng phất mùi thơm của thịt cừu nướng và bánh hồ, còn có cả mùi khói thuốc súng sau khi đốt pháo hoa.|none|Thị tập|none|none

Ngươi chen vào đám đông, nhìn quanh quẩn khắp nơi để tìm kiếm cái đuôi rồng màu trắng bạc lộ liễu của Tiền Đường Quân. Nhưng ngoại bảo hôm nay thực sự quá chật chội, khắp nơi đều là người chen chúc xô đẩy, ngươi xoay xở nửa ngày cũng không tìm thấy bóng dáng nàng đâu. "Con rồng thối này rốt cuộc trốn ở đâu rồi..." Ngươi thầm nhủ trong lòng, một bên né tránh đám nhóc tì chạy loạn, một bên đi về phía sân khấu. Đằng xa truyền đến tiếng trống chiêng, kịch hội sắp bắt đầu rồi.|none|Thị tập|none|none

Sân khấu kịch được dựng trên quảng trường lớn nhất ngoại bảo, bằng gỗ thô và vải màu, xung quanh cắm đầy đuốc, soi rực rỡ như ban ngày. Phía dưới sân khấu đã bị người ta bao vây ba lớp trong ba lớp ngoài, nam nữ già trẻ đều rướn cổ chờ xem kịch khai màn. Ngươi khó khăn lắm mới chen được vào một chỗ có thể nhìn thấy sân khấu, bên tai truyền đến tiếng tán gẫu của hai bà thím. "Này, nghe nói chưa? Năm nay người diễn vai Huyền Nữ nương nương thay đổi rồi!" "Thay đổi rồi? Không phải mời danh giác từ Y Châu sao?" "Danh giác ngã bệnh trên đường, phải thay người gấp!" "Thay ai rồi?" "Không biết nữa, nghe nói là đệ tử Thiên Sơn phái, các vị trưởng lão trong phái đích thân điểm danh..."|none|Thị tập|none|none

Lòng ngươi thót lại một cái. Một dự cảm bất lành dâng lên trong lòng. Ngươi nhớ lại câu "Năm nay rất đặc biệt" của Tiền Đường Quân, nhớ lại nụ cười thần bí của nàng, nhớ lại hành động bất thường xuống núi sớm của nàng... Không lẽ nào?|none|Thị tập|none|none
</MAIN_TEXT>

<SUMMARY>
Ngươi đến ngoại bảo, phát hiện hội chợ náo nhiệt phi phàm, đèn đuốc sáng trưng như ban ngày. Thế nhưng tìm khắp nơi cũng không thấy Tiền Đường Quân, ngươi đành đứng một mình trước sân khấu kịch. Trước khi diễn, ngươi nghe nói danh giác vốn định biểu diễn đã vắng mặt vì bệnh, năm nay sẽ do đệ tử Thiên Sơn phái diễn thay.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Hát kịch sắp bắt đầu, thế nhưng tìm khắp nơi không thấy Tiền Đường Quân, trong lòng ngươi thầm có điềm báo...",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "19:00",
    "Người chơi": {
        "Thay đổi vị trí": "Thị tập"
    },
    "NPC hiện tại": {
        "Tiền Đường Quân": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Thị tập"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    // ==================== 第三段：粉墨登场 ====================
    {
        id: "QTJ_Festival_3",
        name: "Đản thần Cửu Thiên Huyền Nữ 3 - Phấn mặc lên sàn",
        priority: 68,
        conditions: {
            currentSpecialEvent: { equals: 'QTJ_Festival_2' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Tiếng trống chiêng đột ngột vang lên, đám đông im lặng trở lại. Một vị lão giả bước lên sân khấu, hắng giọng hét lớn: "Kính thưa các vị hương thân phụ lão! Hội kịch mừng đản thần Huyền Nữ nương nương năm nay, vì danh giác mang bệnh, do đệ tử Thiên Sơn phái chúng ta diễn thay, mong được hải hàm chiếu cố! Sau đây xin mời —— Cửu Thiên Huyền Nữ nương nương!"|none|Thị tập|none|none

Bức màn từ từ kéo ra. Ánh sáng từ những ngọn đuốc chiếu rọi lên sân khấu, một bóng người từ sau bức màn bước ra —— mắt ngươi lập tức trợn tròn. Đó là một nữ tử đang khoác lên mình bộ hý phục lộng lẫy, đầu đội phượng quan, thân choàng hà phi, trên mặt được trang điểm tinh tế, tay cầm một thanh ngọc như ý, đoan trang hoa quý, tiên khí phiêu phiêu. Nhưng ngươi nhận ra đôi sừng rồng đỏ rực đó, nhận ra cái đuôi rồng bạc đó —— cho dù đã bị hà phi che mất quá nửa, vẫn có thể thấy chóp đuôi đang bất an mà ngoáy qua ngoáy lại. Là Tiền Đường Quân.|Tiền Đường Quân|Thị tập|Cảnh đặc tả 1|none

Não ngươi vang lên một tiếng "uỳnh". Cái con nhỏ bạn xấu ngày thường vốn bộp chộp, vô tư lự, động một chút là đe dọa sẽ bổ ngươi thành hai nửa bằng búa, lúc này đang đứng trên sân khấu kịch, vô cùng nghiêm chỉnh đóng vai Huyền Nữ nguyên quân. Ngươi ra sức dụi mắt, xác định bản thân không nhìn lầm. Ngươi thầm nghĩ: "Không ngờ được... hóa ra là cái 'đặc biệt' này..."|Tiền Đường Quân|Thị tập|Cảnh đặc tả 1|none

Tiền Đường Quân trên sân khấu dường như hoàn toàn biến thành một người khác. Bước chân của nàng uyển chuyển, thân hình thẳng tắp, trong ánh mắt toát ra một luồng khí thế không giận tự uy. Nàng cất tiếng hát, giọng hát uyển chuyển tinh tế, thế mà lại hay đến mức ngoài ý liệu. Ngươi thực ra biết nàng biết hát kịch —— hồi nhỏ khi lăn lộn ở ngoại bảo, nàng thi thoảng sẽ ngân nga vài câu hý từ, nhưng ngươi chưa bao giờ nghiêm túc nghe, chỉ coi như nàng ca hát chơi bời thôi. Không ngờ khi nghiêm túc hát lên, lại là cái trình độ này.|Tiền Đường Quân|Thị tập|Cảnh đặc tả 1|none

Khán giả xung quanh cũng bị chấn động. Lúc đầu là một mảnh tĩnh lặng, sau đó bùng nổ lên tiếng hô vang dậy như sấm rền. "Hay!" "Hát hay quá!" "Cửu Thiên Huyền Nữ nương nương hiển linh rồi!" Ánh sáng của đuốc rọi chiếu lên phượng quan của nàng, hào quang rực rỡ. Ngươi đứng giữa đám đông, nhìn bóng hình vừa quen thuộc vừa xa lạ trên sân khấu, trong lòng cuộn trào những cảm xúc khó tả. Ngươi thầm nghĩ: "Cái con nhỏ này... hóa ra vẫn giấu bài này."|Tiền Đường Quân|Thị tập|Cảnh đặc tả 1|none
</MAIN_TEXT>

<SUMMARY>
Lên sân khấu thủ vai Cửu Thiên Huyền Nữ hóa ra lại là Tiền Đường Quân. Nàng vốn ngày thường bộp chộp lúc này đang khoác lên mình bộ hoa phục, trang điểm tinh tế, từng cử chỉ hành động đều đoan trang đại khí, giọng hát uyển chuyển lay động lòng người. Ngươi thực ra biết nàng từ nhỏ đã học hát kịch, nhưng không ngờ nàng thật sự dám lên sân khấu, hơn nữa còn hát hay đến vậy.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Tiền Đường Quân đang thủ vai Cửu Thiên Huyền Nữ trên sân khấu, màn biểu diễn làm kinh ngạc toàn trường. Ngươi quyết định xem xong vở kịch này rồi tìm nàng hỏi cho rõ.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "19:30",
    "Người chơi": {
        "Thay đổi vị trí": "Thị tập"
    },
    "NPC hiện tại": {
        "Tiền Đường Quân": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Thị tập"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    // ==================== 第四段：粉墨登场 ====================
    {
        id: "QTJ_Festival_4",
        name: "Đản thần Cửu Thiên Huyền Nữ 4 - Phía sau hạ màn",
        priority: 67,
        conditions: {
            currentSpecialEvent: { equals: 'QTJ_Festival_3' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Buổi biểu diễn kéo dài suốt một canh giờ. Tiền Đường Quân diễn từ đầu đến cuối, kể lại câu chuyện Cửu Thiên Huyền Nữ ban Thiên thư cho Hoàng Đế, giúp Hiên Viên đại bại Xi Vưu một cách đầy hào hùng. Khán giả dưới sân khấu xem đến ngây người, không ít người già còn rơm rớm nước mắt. Ngươi cũng xem đến nhập tâm, có đôi lần còn quên cả chớp mắt. Gió đêm thổi qua, ánh lửa bập bùng, nàng đứng trên sân khấu, hà phi tung bay, thực sự mang theo vài phần phong thái của thần nữ hạ phàm.|Tiền Đường Quân|Thị tập|Bình tĩnh|none

Tiếng trống chiêng ngừng hẳn, vở đại kịch hạ màn. Tiền Đường Quân đứng trên sân khấu cúi chào tạ lễ khán giả, dưới sân khấu tiếng vỗ tay vang dội như sấm. Có người ném hoa lên đài, có người hét lớn "Cửu Thiên nương nương phù hộ". Ngươi thừa lúc đám đông hỗn loạn tản đi, lặng lẽ vòng ra phía sau sân khấu.|none|Đình viện|none|none

Hậu đài là một chiếc lều vải dựng tạm, bên trong bày đầy hý phục và đạo cụ. Ngươi vén rèm chui vào, vừa vặn thấy Tiền Đường Quân đang ngồi trước gương đồng, phượng quan còn chưa kịp tháo, đang bưng một bát trà xanh tu ừng ực vào miệng, uống đến mức nước trà dính đầy mép cũng không kịp lau. Nghe thấy động tĩnh, nàng từ trong gương nhìn thấy bạn, đôi đồng tử đỏ rực thoáng qua một chút... đắc ý?|Tiền Đường Quân|Đình viện|Đắc ý|none

"Hì!" Nàng đặt bát trà xuống, xoay người lại, hai tay chống nạnh, cằm vểnh cao lên, cái vẻ đắc ý đó gần như muốn trào ra ngoài: "Thế nào thế nào? Màn biểu diễn vừa rồi của bản rồng có phải là thiên nhân hạ phàm không? Có phải là tuyệt phẩm thế gian không? Có phải là ——" "Phải phải phải," Ngươi không kiêng nể mà ngắt lời nàng, "Có phải là nên lau sạch vết trà bên khóe miệng đi không? Cửu Thiên Huyền Nữ nương nương?"|Tiền Đường Quân|Đình viện|Cười lớn|none

Tiền Đường Quân ngẩn người, đưa tay quệt một cái lên mép, quả nhiên dính đầy nước trà. Nàng lườm bạn một cái, đuôi rồng tức giận quất nhẹ hai cái, nhưng rất nhanh lại khôi phục cái vẻ đắc ý rạng ngời đó: "Oa ha ha ha, tiểu tiết thôi, tiểu tiết thôi! Bản rồng hôm nay chính là đào chính của buổi kịch! Đào chính ngươi hiểu không? Toàn bộ khán giả đều hò reo vì bản rồng! Ngươi thấy chưa? Mấy bà lão đó đều khóc hết cả rồi! Vì cảm động mà khóc đấy!" "Ta thấy rồi," Ngươi tựa vào khung cửa, khoanh tay trước ngực, "Ta còn thấy lúc ngươi tạ lễ hạ màn, chân còn đang run đấy."|Tiền Đường Quân|Đình viện|Đắc ý|none

Nụ cười của Tiền Đường Quân cứng lại trong thoáng chốc. "Nói bậy! Bản rồng làm gì có ——" "Mỗi lần ngươi căng thẳng, đuôi rồng đều sẽ quẫy sang bên trái," Ngươi chậm rãi nói, "Lúc nãy khi ngươi tạ lễ, đuôi rồng quẫy sang trái bảy lần, ta có đếm đấy." Nàng há hốc mồm, định phản bác điều gì đó nhưng lại không nói nên lời. Đuôi rồng quả nhiên lại chột dạ mà quẫy sang trái một cái.|Tiền Đường Quân|Đình viện|Ngại ngùng|none

"... Ngươi từ bao giờ trở nên đáng ghét như vậy?" Nàng lầm bầm, quay người lại tiếp tục tháo phượng quan trên đầu xuống, "Uổng công bản rồng còn muốn tặng ngươi một bất ngờ." "Bất ngờ thì đúng là có bất ngờ thật," Ngươi bước lại gần vài bước, ngồi xuống chiếc hòm gỗ bên cạnh nàng, "Ta thực sự không ngờ ngươi lại lên sân khấu. Không phải ngươi nói sẽ không bao giờ hát kịch nữa sao?"|Tiền Đường Quân|Đình viện|Phân vân|none

Động tác của Tiền Đường Quân khựng lại. Nàng im lặng một lát, mái tóc bạc dài xõa xuống từ dưới phượng quan, dưới ánh đèn dầu tỏa ra hào quang dịu nhẹ. "... Ngươi vẫn còn nhớ?" "Phế vật." Ngươi nói, "Hồi nhỏ ở ngoại bảo, lúc ngươi ngân nga mấy câu hý từ đó, ta vẫn đứng bên cạnh nghe mà. Tuy lúc đó ngươi hát sai nhạc trật nhịp đến mức kinh người ——"|Tiền Đường Quân|Đình viện|Kinh ngạc|none

Nàng ngẩn người, quay đầu lại nhìn bạn, đôi mắt đỏ rực mang theo một loại cảm xúc mà bạn không hiểu nổi. "Ngươi... vẫn luôn nhớ rõ sao?" "Dĩ nhiên nhớ rõ." Ngươi nhún vai, "Hai đứa mình cùng nhau lớn lên, chuyện của ngươi có gì mà ta không biết. Vương ban chủ của đoàn kịch dạy ngươi hát, ngày nào trời chưa sáng đã bắt đầu luyện giọng. Sau này ngươi gia nhập Thiên Sơn phái, nói cái gì mà 'luyện võ mới là chính đạo', từ đó không bao giờ hát nữa."|Tiền Đường Quân|Đình viện|Bình tĩnh|none

Ngươi không nhắc lại việc tại sao nàng lại phải đến đoàn kịch giúp đỡ. Ngươi biết những ngày đó —— nàng vẫn chưa được Động Đình Quân nhận về, sống vất vưởng trong đám người tị nạn, ăn không đủ no mặc không đủ ấm, đến đoàn kịch làm chân chạy việc để kiếm miếng cơm ăn. Ngươi cũng biết một nửa huyết thống Đảng Hạng đó đã mang lại cho nàng bao nhiêu sự ghẻ lạnh và bắt nạt. Nhưng những chuyện này, ngươi chưa bao giờ chủ động nhắc tới. Nàng không nói, ngươi cũng không hỏi. Đó là sự ăn ý nhiều năm giữa các ngươi.|Tiền Đường Quân|Đình viện|Bình tĩnh|none

"Hôm nay sao đột nhiên lại hát?" Ngươi hỏi, "Động Đình trưởng lão ép ngươi à?" "Cái gì mà ép!" Tiền Đường Quân lườm bạn một cái, nhưng ngữ khí đã dịu đi, "Là... là vì đào chính bị bệnh, chị nói bà con ngoại bảo đã trông chờ cả năm trời, không thể để họ thất vọng. Trong phái chỉ có ta từng học vở kịch này, hơn nữa..." Nàng khựng lại, đuôi rồng bất an ngoáy ngoáy, "Hơn nữa chị nói, ta hát còn hay hơn cả đào chính đó."|Tiền Đường Quân|Đình viện|Ngại ngùng|none

"Vậy chị ngươi nói đúng đấy," Ngươi nhìn nàng, nghiêm túc nói, "Hôm nay ngươi diễn thực sự rất hay. Không phải nịnh hót đâu —— là hay thật sự. Ngươi trên sân khấu so với bình thường hoàn toàn khác hẳn." Ngón tay Tiền Đường Quân dừng lại giữa mái tóc, sừng rồng âm thầm ửng lên vệt hồng nhàn nhạt. "... Hôm nay ngươi uống nhầm thuốc hả?" Giọng nàng có chút run rẩy, "Sao toàn nói mấy lời sến súa thế?" "Ta nói thật lòng mà thôi."|Tiền Đường Quân|Đình viện|Ngại ngùng|none

Im lặng một lúc. Trong lều vải chỉ còn tiếng náo nhiệt từ bên ngoài vọng vào, và tiếng lách tách nhỏ của ngọn đèn dầu đang cháy. Sau đó Tiền Đường Quân đột nhiên "phụt" một tiếng cười ra ngoài, đưa tay vỗ một cái lên đầu bạn: "Được rồi được rồi, bản rồng biết mình lợi hại rồi! Không cần ngươi khen nữa!" Nàng đứng dậy, vơ lấy chiếc ngoại bào khoác lên người, khôi phục lại cái vẻ vô tư lự thường ngày, "Đi thôi đi thôi! Bản rồng hát suốt một canh giờ, đói lả người rồi! Bên ngoài hội chợ còn náo nhiệt lắm, ngươi mời khách nhé!"|Tiền Đường Quân|Đình viện|Cười lớn|none

"Tại sao lại là ta mời khách?" "Tại ngươi đến muộn!" "Ta đến muộn? Rõ ràng là ngươi ——" "Bớt nói nhảm đi!" Nàng nắm lấy cổ tay bạn lôi ra ngoài, sức mạnh lớn đến kinh người, "Đào chính xuất hành, tùy tùng thanh toán, đó là thiên kinh địa nghĩa!"|Tiền Đường Quân|Đình viện|Đắc ý|none
</MAIN_TEXT>

<SUMMARY>
Vở kịch kết thúc, ngươi lẻn vào hậu đài tìm Tiền Đường Quân. Nàng không những không thẹn thùng mà còn đắc ý khoe khoang mình là "đào chính của buổi kịch", còn bị ngươi trêu chọc chuyện trà dính trên mép và chân run lúc hạ màn. Ngươi vạch trần thói quen quẫy đuôi sang trái mỗi khi căng thẳng của nàng khiến nàng á khẩu. Là thanh mai trúc mã, ngươi thực ra vẫn luôn nhớ chuyện nàng học hát kịch lúc nhỏ nhưng không bao giờ chủ động nhắc lại quãng thời gian gian khó đó. Ngươi chân thành khen ngợi "hôm nay ngươi hát rất hay", nàng ửng hồng sừng rồng, miệng thì bảo sến súa nhưng rất nhanh đã khôi phục trạng thái, kéo bạn đi dạo hội chợ.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Sự ăn ý giữa ngươi và Tiền Đường Quân khiến cuộc trò chuyện này trở nên ấm áp và tự nhiên. Bây giờ nàng đang kéo ngươi chuẩn bị đi dạo chợ đêm.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "21:30",
    "Người chơi": {
        "Thay đổi vị trí": "Thị tập"
    },
    "NPC hiện tại": {
        "Tiền Đường Quân": {
            "Thay đổi hảo cảm": "Tăng lên",
            "Thay đổi vị trí": "Thị tập"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    {
        id: "QTJ_Festival_5",
        name: "Đản thần Cửu Thiên Huyền Nữ 5 - Cùng dạo hội chợ",
        priority: 66,
        conditions: {
            currentSpecialEvent: { equals: 'QTJ_Festival_4' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Chợ đêm còn náo nhiệt hơn ban ngày. Ánh sáng từ đèn lồng chiếu rọi cả con phố rực rỡ, khắp nơi là tiếng rao hàng, tiếng cười đùa, tiếng va chạm của bát đĩa xoong nồi. Tiền Đường Quân đã thay hý phục, nhưng khuôn mặt đó thực sự quá đỗi xuất chúng —— mái tóc bạc dài dưới ánh đèn tỏa ra hào quang dịu nhẹ, đôi sừng rồng đỏ rực giữa đám đông vô cùng bắt mắt —— đi tới đâu cũng có người ngoái nhìn. Ngươi bị nàng kéo từ đầu phố ăn đến cuối phố, mứt quả bọc đường, thịt cừu nướng, bánh hồ, trà bơ, viên chiên... Sức công phá của nàng thực sự kinh người, ngươi nghi ngờ trong bụng nàng có phải là một không gian khác hay không.|Tiền Đường Quân|Thị tập|Hứng khởi|none

"Phù ——" Nàng thỏa mãn vỗ vỗ bụng, ợ một tiếng rõ to, "Thật là thoải mái!" "Ngươi rốt cuộc là rồng hay là heo thế?" Ngươi nhìn cái túi tiền xẹp lép của mình, dở khóc dở cười, "Tiền trợ cấp tháng này của ta toàn bộ đều nạp vào bụng ngươi hết rồi." "Hì hì, mời đào chính nổi tiếng xuất hành đồng du, làm gì có chuyện không tốn tiền?" Nàng vỗ vỗ vai bạn, bộ dạng "vô cùng đồng cảm nhưng tuyệt không mềm lòng", "Hơn nữa, ai bảo ngươi là tùy tùng của ta chứ? Thắng làm vua thua chịu phạt!" "Ta khi nào cá cược với ngươi chứ?" "Ngươi đến muộn mà." "Rõ ràng là ngươi chạy trước ——"|Tiền Đường Quân|Thị tập|Đắc ý|none

Ngươi thực sự là dở khóc dở cười. Cái da mặt này của nàng chắc phải dày hơn tường thành. Mọi người vừa ăn vừa dạo, đi ngang qua một sạp hàng vớt cá vàng, mắt Tiền Đường Quân sáng lên: "Oa! Cá vàng! Bản rồng muốn vớt!" Nàng ngồi xổm xuống chộp lấy vợt giấy nhúng ngay vào chậu —— Phạch! Vợt giấy vừa chạm nước đã rách. "Cái đồ quỷ gì thế này!" Nàng lườm cái cán gỗ trong tay, đuôi rồng tức giận xù lông lên, "Lừa đảo!" Sau đó —— Phạch! Phạch! Phạch! Rách liên tiếp ba cái.|Tiền Đường Quân|Thị tập|Nổi giận|none

Ngươi thực sự không nhìn nổi nữa, cầm lấy vợt giấy từ tay nàng, ngồi xổm xuống, hít sâu một hơi, nghiêng vợt giấy cắm vào trong nước, mượn sức nổi của nước nâng một con cá vàng nhỏ lên, sau đó nhanh chóng và ổn định nhấc ra khỏi mặt nước —— thành công rồi. "Oạch!" Tiền Đường Quân trợn tròn mắt, "Ngươi làm thế nào vậy!" "Hồi nhỏ ở ngoại bảo học được, ngươi quên rồi sao?" Ngươi cho con cá vàng nhỏ vào chiếc túi mà chủ sạp đưa tới, "Lúc đó ngươi chỉ lo luyện giọng, ta rảnh rỗi không có việc gì nên đứng bên sạp xem người ta vớt." Ngươi đưa chiếc túi đựng cá vàng cho nàng: "Cho ngươi này." "Hả?" "Dù sao ta cũng không nuôi nổi, cho ngươi đấy. Coi như là tạ lễ xem kịch hôm nay."|Tiền Đường Quân|Thị tập|Kinh ngạc|none

Tiền Đường Quân nhận lấy chiếc túi, nhìn chằm chằm con cá đỏ nhỏ đang bơi lội bên trong, nửa ngày không nói lời nào. Ánh sáng đèn lồng chiếu lên mặt nàng, biểu cảm của nàng có chút kỳ lạ. "... Hừ," Nàng quay mặt đi chỗ khác, đuôi rồng lại bí mật vểnh lên, "Coi như ngươi còn chút lương tâm."|Tiền Đường Quân|Thị tập|Ngại ngùng|none

Mọi người tiếp tục đi về phía trước. Đi ngang qua một sạp bán trang sức, bước chân nàng chậm lại, mắt dán chặt vào một đôi bông tai bằng bạc —— chế tác tinh xảo, đính những chiếc chuông nhỏ, khi rung rinh sẽ phát ra âm thanh thanh thúy. Ngươi đang định nói gì đó, phía sau đột nhiên truyền đến tiếng bàn tán của vài người trẻ tuổi —— "Này, các người nhìn cô nương bên kia xem, có phải là người đóng vai Cửu Thiên Huyền Nữ trên sân khấu lúc nãy không?" "Hình như đúng đấy! Nhìn cái sừng rồng kìa!" "Oa, người thật còn đẹp hơn trên sân khấu nữa!" "Cái tên nam nhi bên cạnh nàng là ai đấy?" "Không biết, nhìn cũng khá đẹp đôi." "Đúng vậy đúng vậy, trai tài gái sắc, chắc không phải là một đôi chứ?"|none|Thị tập|none|none

Bước chân ngươi khựng lại một chút. Liếc mắt nhìn Tiền Đường Quân, muốn xem nàng phản ứng thế nào —— kết quả nàng thế mà lại vô cùng điềm tĩnh, thậm chí còn quay đầu lại, nhướn mày, dùng ánh mắt "ngươi nghe thấy rồi chứ" nhìn bạn. "Sao vậy?" Khóe môi nàng nhếch lên một nụ cười tinh quái, đuôi rồng đắc ý ngoáy ngoáy, "Được người ta nói là xứng đôi với bản rồng, thấy mất mặt lắm hả?"|Tiền Đường Quân|Thị tập|Đắc ý|none

"Không có, ta ——" "Hay là," Nàng tiến gần thêm một bước, đôi đồng tử đỏ rực lấp lánh, đầu mũi gần như chạm vào mặt bạn, "Ngươi cảm thấy mình không xứng với bản rồng?" "..." Ngươi nhất thời cứng họng. Cái con nhỏ này, từ bao giờ đã học được chiêu phản kích này rồi? "Oa ha ha ha!" Thấy biểu cảm cứng họng của bạn, Tiền Đường Quân cười đến mức nghiêng ngả, đuôi rồng quẫy tít mù vui sướng, "Đùa thôi mà! Cái mặt đó của ngươi trông buồn cười quá đi mất! Thả lỏng đi, hai ta là huynh đệ, huynh đệ ngươi hiểu không? Người ta thích nói gì thì nói, liên quan gì đến chúng ta?"|Tiền Đường Quân|Thị tập|Cười lớn|none

Nàng nói thật thoải mái, giống như hoàn toàn không để tâm. Nhưng ngươi chú ý thấy, sừng rồng của nàng —— hai cái sừng nhỏ màu đỏ rực đó —— đỉnh chóp đã âm thầm ửng lên một lớp hồng nhạt. "Đúng rồi," Nàng giống như nhớ ra điều gì đó, đột ngột đổi chủ đề, chỉ vào sạp trang sức đó, "Ngươi thấy đôi bông tai đó có đẹp không?" Nàng nói một cách lơ đãng, nhưng đuôi rồng lại không kìm được mà quẫy về hướng đó một chút.|Tiền Đường Quân|Thị tập|Bình tĩnh|none

Ngươi nhìn nàng một cái, không nói gì, bước đến trước sạp hàng, lấy ra mấy đồng tiền đồng cuối cùng còn sót lại. "Ông chủ, đôi bông tai này tôi lấy." "Hả?" Tiền Đường Quân ngẩn người, "Ngươi, ngươi làm gì thế ——" "Cho ngươi đấy." Ngươi đưa đôi bông tai qua, "Lúc nãy không phải nói đẹp sao?" "Bản rồng chỉ là tùy miệng nói một câu thôi, cũng không phải là thật sự muốn!" Giọng nàng đột nhiên cao lên vài tông. "Ồ, vậy ta trả lại?" "... Đừng." Nàng nhanh chóng cướp lấy đôi bông tai nắm chặt trong tay, sừng rồng đã đỏ bừng lên hết cả, "Nếu đã mua rồi thì coi như là tùy tùng hiếu kính bản rồng, bản rồng miễn cưỡng nhận lấy vậy."|Tiền Đường Quân|Thị tập|Ngại ngùng|none
</MAIN_TEXT>

<SUMMARY>
Ngươi cùng Tiền Đường Quân dạo chợ đêm, ăn từ đầu phố đến cuối phố, còn chơi vớt cá vàng —— nàng làm rách mấy cái vợt giấy cũng không vớt được, ngươi một lần thành công, đem cá vàng tặng cho nàng. Người qua đường bàn tán hai người "trai tài gái sắc", nàng chẳng những không thẹn thùng mà còn vô tư vặn hỏi ngươi "cảm thấy không xứng với bản rồng sao?", dùng cách của bạn xấu để hóa giải không khí ám muội. Ngươi mua đôi bông tai nàng thầm thích tặng nàng, nàng miệng cứng bảo "không muốn", nhưng sừng rồng đã đỏ lựng cả lên.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Sự ăn ý giữa ngươi và Tiền Đường Quân khiến cuộc trò chuyện này trở nên ấm áp và tự nhiên. Bây giờ hai người đã dạo qua chợ đêm, mua được cá vàng và bông tai nàng thích.",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "22:30",
    "Người chơi": {
        "Thay đổi vị trí": "Thị tập"
    },
    "NPC hiện tại": {
        "Tiền Đường Quân": {
            "Thay đổi hảo cảm": "Tăng mạnh",
            "Thay đổi vị trí": "Thị tập"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },
    {
        id: "QTJ_Festival_6",
        name: "Đản thần Cửu Thiên Huyền Nữ 6 - Kết thúc hội chợ",
        priority: 65,
        conditions: {
            currentSpecialEvent: { equals: 'QTJ_Festival_5' }
        },
        effects: {
            GameMode: { set: 0 },
            inputEnable: { set: 1 },
            mapLocation: { set: 'Thiên Sơn phái' },
            companionNPC: { set: [] },
            userLocation: { set: 'tianshanpai' },
            "playerTalents.魅力": { add: 1 }
        },
        text: `< SLG_MODE >

<MAIN_TEXT>
Đêm đã khuya, đám đông ở hội chợ dần dần tản đi. Hai người sóng đôi bước đi trên con đường về núi, ánh trăng rọi xuống lối nhỏ trong thung lũng, ánh bạc lấp lánh hòa làm một với mái tóc của nàng. Tiền Đường Quân một tay xách túi đựng cá vàng, một tay nắm chặt đôi bông tai, tâm trạng có vẻ rất tốt, miệng còn ngân nga hý từ trên sân khấu lúc nãy.

"Này." Nàng đột ngột cất tiếng, giọng nói nhẹ đi. "Hửm?" "Hôm nay..." Nàng khựng lại một lát, đuôi rồng bất an ngoáy ngoáy, "Hôm nay chơi cũng khá vui." "Vậy sao?" Ngươi cố ý hỏi, "Vui hơn cả lúc ngươi một mình làm đào chính trên sân khấu à?" "Dĩ nhiên rồi!" Nàng lườm bạn một cái, nhưng khóe mắt mang theo ý cười, "Hát kịch mệt biết bao nhiêu, cổ họng muốn bốc hỏa luôn. Chẳng thà cùng cái tên ngốc như ngươi ra ngoài dạo phố, được ăn trắng mặc trơn lại còn được quà." "... Cho nên hôm nay ta chỉ là một cái túi tiền di động hả?" "Chứ sao nữa?" Nàng cười vô tư lự, "Huynh đệ không phải để hố thì để làm gì?"

Khi đi đến cổng núi, trăng đã lên tới đỉnh đầu. Tiền Đường Quân dừng bước, quay người nhìn bạn. Ánh trăng rọi lên mái tóc bạc của nàng, phủ lên nàng một lớp hào quang, giống như tiên nữ trên trời thoát tục tuyệt trần. Đôi đồng tử đỏ rực đó phản chiếu ánh trăng, cũng phản chiếu hình bóng của bạn. "Này, {{user}}." Giọng nàng đột nhiên trầm xuống, khác hẳn với vẻ huênh hoang thường ngày. "Sao vậy?" "Hội chợ năm sau..." Nàng mím mím môi, đuôi rồng bất an quẫy đạp, "Năm sau ngươi còn đến không?"

Ngươi nhìn nàng. Nàng dưới ánh trăng không còn vẻ đùa cợt của ban ngày, không còn vẻ đoan trang hoa quý trên sân khấu, chỉ là một thiếu nữ có chút căng thẳng, có chút mong chờ. "Dĩ nhiên là có." Ngươi nói. "... Thật chứ?" "Ừ. Nhưng lần sau nếu ngươi còn lên sân khấu," Ngươi cố ý dừng lại một chút, "Nhớ báo trước cho ta." "Làm gì?" "Để ta còn chuẩn bị hoa tươi chứ." Ngươi nói, "Tặng hoa cho đào chính không phải là thiên kinh địa nghĩa sao?"

Tiền Đường Quân ngẩn người. Dưới ánh trăng, sừng rồng của nàng đỏ rực lên, ngay cả mang tai cũng nhuốm màu đỏ thẫm. Nàng há hốc mồm, dường như muốn nói điều gì đó nhưng lời đến môi lại nuốt xuống. Đuôi rồng bất an ngoáy hai cái, sau đó đột ngột dừng lại. "... Ngươi chờ đó." Giọng nàng lí nhí, quay mặt đi không nhìn bạn, xoay người đi về phía trong cổng núi, "Năm sau nếu dám mang mấy bông hoa dại rách nát đến lừa gạt bản rồng, bản rồng một búa bổ chết ngươi." "Biết rồi biết rồi, cái loại to nhất đẹp nhất." Ngươi cười nói.

"Hừ." Nàng đáp lại một tiếng, bước chân lại nhanh hơn nhiều. Cái đuôi rồng bạc dưới ánh trăng quẫy qua quẫy lại sang bên trái, giống như bước càng nhanh thì càng có thể che giấu tâm tư thiếu nữ. Đi xa thêm mười mấy bước, Tiền Đường Quân không quay đầu lại mà bỏ lại một câu: "Cảm ơn ngươi, hôm nay... đúng là khá vui." Giọng nói nhẹ đến mức gần như bị gió đêm thổi tan. Sau đó nàng rảo bước chạy đi, bóng dáng bạc trắng nhanh chóng biến mất trong màn đêm.
</MAIN_TEXT>

<SUMMARY>
Trên đường về núi, Tiền Đường Quân cùng bạn ôn lại hội chợ hôm nay, nàng hiếm khi nghiêm túc mời ngươi, hỏi ngươi "năm sau còn tới không", ngươi bảo sẽ mang hoa đến tặng cho đào chính. Nàng thẹn thùng bỏ chạy.
</SUMMARY>

<SIDE_NOTE>
{
    "Thời gian": "23:30",
    "Người chơi": {
        "Thay đổi vị trí": "không có"
    },
    "NPC hiện tại": {
        "Tiền Đường Quân": {
            "Thay đổi hảo cảm": "Tăng mạnh",
            "Thay đổi vị trí": "Phòng nữ đệ tử"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    // ==================== 第一回合：甜蜜与苦涩 ====================
    {
        id: "Yuzhu_HamiOasis_Dilemma_1",
        name: "Vũ Chúc · Hạp Lục Châu 1",
        priority: 60,
        conditions: {
            currentWeek: { min: 1 },
            "npcFavorability.H": { min: 55 }
        },
        effects: {
            GameMode: { set: 1 },
            inputEnable: { set: 0 },
            mapLocation: { set: 'Háp Mật Ốc Đảo' },
            companionNPC: { push: 'Vũ Chúc' }
        },
        text: `< SLG_MODE >

<MAIN_TEXT>
Một buổi sáng sớm nọ của tuần mới, hội chợ trái cây tại Hạp Lục Châu tỉnh giấc trong ánh ban mai, trong không khí thoang thoảng mùi hương ngọt ngào của trái cây, xen lẫn chút mùi hăng của rơm rạ và mồ hôi —— điều này khiến bạn không kìm được mà chun chun mũi. Bạn và Vũ Chúc phụng mệnh tới đây thu mua dưa trái, bổ sung dự trữ cho môn phái. Nói là "phụng mệnh", thực chất là do trưởng lão Phá Trận Tử tiện miệng nhắc tới một câu, thế là mắt Vũ Chúc sáng rực lên như vừa tìm thấy kho báu, túm lấy tay áo bạn lắc ba mươi bảy cái, cho đến khi bạn đồng ý đưa nàng xuống núi mới thôi.|Vũ Chúc|Thị tập|Hưng phấn|none

「Ca ca mau nhìn kìa! Quả dưa kia to quá!」 Vũ Chúc giống như một chú chim nhỏ vui vẻ, tung tăng nhảy nhót giữa các sạp hàng, mái tóc dài vàng óng nhảy múa dưới ánh mặt trời, đôi cánh thanh vũ sau lưng không tự chủ được mà khẽ vỗ. Nàng hiếm khi được đi xa, cái gì cũng cảm thấy hiếu kỳ vô cùng —— vừa rồi nàng cứ trừng trừng nhìn một lão đầu bán nặn tò he suốt nửa nén nhang, suýt chút nữa khiến người ta toát mồ hôi hột.|Vũ Chúc|Thị tập|Hưng phấn|none

「Vũ nhi,」 Ngươi bất lực gọi nàng, 「Chúng ta tới đây mua dưa, không phải tới ——」 Lời còn chưa dứt, Vũ Chúc đã không biết từ đâu lôi ra một miếng dưa Hạp Lục Châu đã cắt sẵn, vùi đầu vào ăn lấy ăn để, hai cái má phồng lên như một chú chuột túi tham ăn. Nàng ngẩng đầu lên, khóe miệng đầy nước dưa, đôi mắt xanh thẳm tràn đầy vẻ kinh ngạc: 「Ngọt quá! Ngọt cực kỳ luôn! Ca ca cũng nếm thử đi!」|Vũ Chúc|Thị tập|Đại hỷ|none

Ngươi thầm nghĩ: 「Cái con nhóc này... còn chưa trả tiền nữa.」 Nhưng nhìn bộ dạng thỏa mãn kia của nàng, bạn vẫn lẳng lặng móc từ trong túi ra vài đồng tiền xu, đưa cho lão nông bên cạnh đang cười không khép được miệng. Lão nông là một lão hán da đen sạm, khuôn mặt đầy nếp nhăn cười đến mức dồn cả lại: 「Tiểu cô nương thật là có phúc, đây là mẻ dưa mật đầu mùa năm nay đấy, ngọt lịm luôn!」|Vũ Chúc|Thị tập|Mỉm cười|none

Vũ Chúc vừa đi vừa ăn, đột nhiên dừng bước, nghiêng đầu nhìn bạn. Nàng đưa miếng dưa trên tay tới, trên thịt dưa vẫn còn lưu lại dấu răng của nàng: 「Ca ca, huynh ăn bên này đi, chỗ Vũ nhi cắn rồi là ngọt nhất đấy.」 Ngươi ngẩn ra một lát, không biết nên cảm động vì tinh thần chia sẻ của nàng, hay là nên phàn nàn về quan niệm vệ sinh của nàng nữa. Ngươi thầm nghĩ: 「Thôi kệ đi, dù sao cũng là đồng môn sư huynh muội, ăn thì ăn thôi?」|Vũ Chúc|Thị tập|Mỉm cười|none

Ngươi vừa định cắn một miếng, phía sau hội chợ đột nhiên truyền tới một trận xôn xao. 「Bắt lấy hắn! Tên tiểu tặc!」 「Đừng để hắn chạy mất!」 Đám đông giống như mặt nước bị đá ném trúng, tản ra tứ phía. Ngươi kéo Vũ Chúc lại, cảnh giác nhìn về hướng đang náo loạn —— chỉ thấy một thiếu niên gầy giơ xương bị vài gã tráng sĩ ấn ngã xuống đất, trong tay vẫn nắm chặt một túi tiền.|none|Thị tập|none|none

「Dám trộm tiền của lão tử!」 Một lão hán xông tới, vung đòn gánh định nện thẳng xuống người thiếu niên. Chính là Vương đại gia vừa bán dưa cho hai người khi nãy, lúc này nụ cười trên mặt lão đã hoàn toàn biến mất, thay vào đó là vẻ phẫn nộ đáng sợ: 「Đánh gãy tay nó đi! Cho nó biết hậu quả của việc trộm cắp là như thế nào!」|none|Thị tập|none|none

Thiếu niên bị ấn trên đất, mặt úp xuống đất bùn, cái lưng gầy trơ xương dưới ánh mặt trời trông vô cùng nhức mắt. Hắn không hề vùng vẫy, cũng không hề cầu xin, chỉ càng nắm chặt túi tiền hơn, dường như đó là mạng sống của hắn vậy. Đòn gánh giơ cao ——|none|Thị tập|none|none

「Dừng tay!」 Giọng nói của Vũ Chúc vang lên bên cạnh bạn. Ngươi quay đầu lại, phát hiện nàng đã xông ra ngoài được ba bước, đôi cánh hơi xòe ra, không biết từ lúc nào đã nắm chặt Liên Vũ Tác trong tay, tỏa ra ánh bạc lấp lánh. Khuôn mặt nàng không còn nụ cười khi nãy, đôi mắt xanh thẳm tràn đầy vẻ lo lắng: 「Không được đánh người! Sẽ đánh chết người đấy!」|Vũ Chúc|Thị tập|Căng thẳng|none

Ngươi chộp lấy cổ tay nàng: 「Đợi đã, nhìn kỹ tình hình đã.」 Ngươi thầm nghĩ: 「Con nhóc này tâm địa lương thiện là chuyện tốt, nhưng chuyện trên giang hồ đâu có đơn giản như vậy... Mạo muội ra tay, không khéo lại rước họa vào thân.」 Vũ Chúc sốt ruột đến mức vành mắt đỏ hoe, đôi cánh run rẩy không ngừng: 「Nhưng hắn sẽ bị đánh chết mất!」 「Ta biết,」 Ngươi hạ thấp giọng, 「Nhưng chúng ta là người của Thiên Sơn phái, không thể tùy tiện nhúng tay vào chuyện của địa phương... Cứ hỏi rõ ràng rồi tính.」|Vũ Chúc|Thị tập|Phân vân|none

Đòn gánh khựng lại giữa không trung. Vương đại gia thở hồng hộc, trợn mắt nhìn thiếu niên dưới đất: 「Hỏi cái gì mà hỏi! Tang vật rành rành ra đó, còn gì để hỏi nữa!」 Đám đông vây quanh xem ngày một đông, có kẻ reo hò, có kẻ lạnh lùng đứng xem, có kẻ lại xì xầm bàn tán —— nhưng chẳng có ai tiến lên ngăn cản. Ngươi thầm nghĩ: 「Mỗi người đều có lập trường riêng, mỗi người đều có nỗi khổ riêng. Còn chúng ta...」 Ngươi liếc nhìn Vũ Chúc. Nàng cắn chặt môi, vành mắt đỏ rực, nhưng vẫn bị bạn giữ chặt, không thể động đậy. Đôi cánh phía sau nàng run rẩy kịch liệt, cực kỳ giống một chú chim nhỏ muốn bay đi nhưng lại bị cầm tù.|Vũ Chúc|Thị tập|Đau buồn|none
</MAIN_TEXT>

<SUMMARY>
Ngươi và Vũ Chúc phụng mệnh tới Hạp Lục Châu thu mua dưa trái. Lần đầu tiên Vũ Chúc được ăn dưa Hạp Lục Châu, nàng vui vẻ như một chú chuột túi nhỏ. Tuy nhiên niềm vui ngắn chẳng tày gang, một thiếu niên gầy giơ xương đã trộm túi tiền của lão nông dưa Vương đại gia và bị bắt quả tang, Vương đại gia trong cơn thịnh nộ định đánh gãy tay hắn. Vũ Chúc muốn xông lên ngăn cản, ngươi kéo nàng lại, nhắc nhở nàng nhìn kỹ tình hình rồi tính. Đám đông xung quanh lạnh lùng đứng xem, Vũ Chúc sốt ruột đến mức đôi cánh run rẩy, rơi vào tình thế tiến thoái lưỡng nan.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Thiếu niên trộm tiền bị bắt, sắp bị đánh. Vũ Chúc muốn ra tay ngăn cản, ngươi kéo nàng lại. Đám đông xung quanh lạnh lùng đứng xem, đòn gánh giơ cao —— các ngươi sẽ lựa chọn thế nào?",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "09:30",
    "Người chơi": {
        "Thay đổi vị trí": "Thị tập"
    },
    "NPC hiện tại": {
        "Vũ Chúc": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Thị tập"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    // ==================== 第二回合：没有对错的困局 ====================
    // ==================== Hồi 2: Thế tiến thoái lưỡng nan không phân đúng sai ====================
    {
        id: "Yuzhu_HamiOasis_Dilemma_2",
        name: "Vũ Chúc · Hạp Lục Châu 2",
        priority: 59,
        conditions: {
            currentSpecialEvent: { equals: 'Yuzhu_HamiOasis_Dilemma_1' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
「Khoan đã.」 Ngươi tiến lên một bước, 「Vị lão trượng này, đánh người thì được, nhưng liệu có thể để vãn bối hỏi vài câu trước không?」 Vương đại gia hồ nghi nhìn bạn, đòn gánh vẫn giơ cao: 「Ngươi là ai?」 「Một kẻ giang hồ đi ngang qua thôi.」 Ngươi chắp tay, 「Chỉ là muốn làm rõ, trong túi tiền này có bao nhiêu bạc mà đáng để đánh gãy tay một người?」|none|Thị tập|none|none

「Ba lượng bảy tiền!」 Vương đại gia gầm lên, gân xanh nổi đầy mình, 「Lão tử trồng dưa cả đời, năm nay thu hoạch mới bán được giá tốt! Số tiền này là để mua thuốc cho lão cha ta! Ông ấy đã liệt giường ba năm rồi, chỉ chờ số tiền này để giữ mạng thôi!」 Giọng ông run rẩy, vành mắt đỏ hoe: 「Lão cha ta bảy mươi tám tuổi rồi... nếu không chữa trị, e là không qua nổi mùa đông năm nay...」|none|Thị tập|none|none

Trong đám đông vang lên những tiếng thở dài. Đôi cánh của Vũ Chúc ngừng run rẩy, nàng thẫn thờ nhìn Vương đại gia, biểu cảm trên mặt từ phẫn nộ chuyển sang bối rối. Ngươi thầm nghĩ: 「Quả nhiên không đơn giản như vậy.」 Ngươi cúi người xuống, nhìn về phía thiếu niên đang bị ấn trên đất: 「Còn ngươi? Trộm tiền làm gì?」|none|Thị tập|none|none

Thiếu niên ngẩng đầu lên, lúc này ngươi mới nhìn rõ khuôn mặt hắn —— chỉ mới mười ba mười bốn tuổi, má hóp lại, môi khô khốc, hốc mắt trũng sâu, nhưng lại có một đôi mắt quật cường. Hắn không nhìn bạn, mà trừng trừng nhìn lom lom vào túi tiền trong tay, giọng khàn đặc như giấy nhám: 「Muội muội ta... sốt cao ba ngày rồi... nếu không mua thuốc, muội ấy sẽ chết mất...」|none|Thị tập|none|none

「Bớt bịa chuyện đi!」 Vương đại gia nhổ một bãi nước bọt, 「Tên trộm nào mà chẳng biết tìm cớ!」 「Ta không lừa người!」 Thiếu niên đột nhiên vùng vẫy, bị đám tráng sĩ ấn càng chặt hơn, 「Ta tên A Ngưu! Cha mẹ ta bị Cầm Sinh quân giết rồi! Chỉ còn lại ta và muội muội nương tựa nhau! Muội ấy mới tám tuổi! Muội ấy không làm gì sai cả! Muội ấy chỉ là... chỉ là bị bệnh thôi...」 Giọng hắn nhỏ dần, cuối cùng biến thành tiếng thổn thức.|none|Thị tập|none|none

Đám đông im lặng. Đòn gánh của Vương đại gia vẫn giơ đó, nhưng động tác đã cứng đờ. Vũ Chúc đứng bên cạnh bạn, đôi mắt xanh thẳm tràn đầy vẻ mê mẩn. Nàng há miệng, muốn nói điều gì đó, nhưng lại thấy mình chẳng nói nên lời. Ngươi thầm nghĩ: 「Trộm đồ là người xấu, bị trộm là người tốt —— đây là đạo lý đơn giản nhất. Nhưng bây giờ, người xấu có nỗi khổ của người xấu, người tốt cũng có cái khó của người tốt...」|Vũ Chúc|Thị tập|Phân vân|none

「Hắn đang lừa người đấy!」 Trong đám đông có người hét lên, 「Mấy lời này ai mà chẳng nói được!」 「Đúng thế! Đánh đi!」 「Đừng đánh nữa, nhìn hắn cũng tội nghiệp quá...」 「Tội nghiệp cái gì! Phải tội nghiệp lão Vương chứ! Cha ông ấy đang nằm chờ tiền cứu mạng kìa!」 Tiếng bàn tán xôn xao nổi lên tứ phía, người nói thế này kẻ nói thế nọ, chẳng ai thuyết phục được ai.|none|Thị tập|none|none

A Ngưu đột nhiên từ trong khe hở của đám đông ngẩng đầu lên, trừng trừng nhìn Vương đại gia, trán dập xuống đất đến chảy máu: 「Cầu xin ông... tôi có thể làm tất cả cho ông... tôi có thể làm trâu làm ngựa cho ông... tôi có thể làm việc cả đời cho ông... cầu xin ông cho tôi mang thuốc về... muội muội tôi sắp chết rồi...」 Trán hắn dập xuống đất, từng cái, từng cái một, vang lên bình bịch. Máu từ khóe trán chảy xuống, thấm vào vùng đất khô cằn, nhanh chóng bị hút khô, chỉ để lại những vệt ám đỏ.|none|Thị tập|none|none

Tay Vương đại gia run rẩy. Lão rơi nước mắt, đôi mắt đục ngầu đầy vẻ đau khổ: 「Cha ta... cha ta cũng sắp chết rồi mà... tại sao... tại sao ta phải nhường cho ngươi...」 Giọng lão nghẹn ngào: 「Ta trồng dưa cả đời... ta chưa bao giờ hại ai... tại sao lại là ta...」 Đòn gánh từ tay lão trượt xuống, rơi phạch trên đất, làm cát bụi bay mù mịt.|none|Thị tập|none|none
</MAIN_TEXT>

<SUMMARY>
Ngươi tiến lên hỏi rõ ngọn ngành, phát hiện thiếu niên trộm tiền A Ngưu là trẻ mồ côi có cha mẹ bị Cầm Sinh quân sát hại, trộm tiền là để mua thuốc cứu mạng muội muội tám tuổi đang sốt cao ba ngày. Mà tiền của lão nông Vương đại gia cũng là tiền cứu mạng để mua thuốc cho người cha già bảy mươi tám tuổi đang bại liệt ba năm, không qua nổi mùa đông. Hai "nạn nhân" đều có nỗi khổ riêng không thể giãi bày.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Hai con người đều cần tiền cứu mạng, đúng sai phải trái chẳng còn rõ ràng dễ đoán",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "10:15",
    "Người chơi": {
        "Thay đổi vị trí": "Thị tập"
    },
    "NPC hiện tại": {
        "Vũ Chúc": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Thị tập"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    {
        id: "Yuzhu_HamiOasis_Dilemma_3",
        name: "Vũ Chúc · Hạp Lục Châu 3",
        priority: 58,
        conditions: {
            currentSpecialEvent: { equals: 'Yuzhu_HamiOasis_Dilemma_2' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Cơ thể Vũ Chúc đang run rẩy. Ngươi nhìn nàng —— sắc mặt nàng trắng bệch, đôi môi khẽ run, đôi mắt xanh thẳm tràn đầy vẻ sợ hãi và mê man. Thế giới đơn giản của nàng đang sụp đổ. Trong nhận thức của nàng, trộm đồ là sai, giúp đỡ người khác là đúng, người tốt nên nhận được báo đáp tốt, kẻ xấu nên bị trừng phạt. Nhưng bây giờ —— ai là người tốt? Ai là kẻ xấu? Ai đúng? Ai sai?|Vũ Chúc|Thị tập|Sợ hãi|none

「Tránh ra tránh ra!」 Một tràng huyên náo từ phía rìa đám đông truyền tới, bảy tám kẻ trông như lưu manh địa phương chen vào, cầm đầu là một tên đại hán mặt đầy thịt ngang, trên tay lăm lăm một thanh mã tấu: 「Nghe nói có kẻ gây chuyện? Ồ, Vương lão đầu, ông đây là làm sao thế này?」 Ánh mắt hắn đảo qua A Ngưu đang nằm trên đất, lại đảo qua Vương đại gia, cuối cùng dừng lại trên đống dưa Hạp Lục Châu chất cao như núi ở sạp hàng, mắt sáng rực lên: 「Thế này đi, ta giúp ông dạy dỗ tên tiểu tặc này, ông đưa đống dưa này cho ta, coi như huề nhau. Thế nào?」|none|Thị tập|none|none

Sắc mặt Vương đại gia càng thêm trắng bệch: 「Chuyện này... đây là công sức cả năm của ta...」 「Vậy ông muốn thế nào?」 Tên mặt thịt cắm mạnh thanh mã tấu xuống đất, 「Báo quan? Quan đại gia sẽ quản chuyện của một tên bán dưa như ông sao? Hay là ông muốn tự tay hành động? Được thôi, đánh chết người ông đền nổi không?」 Ánh mắt hắn đảo qua đám đông xung quanh, nở nụ cười nham hiểm: 「Lý Tam ta đây ở mảnh đất này nói chuyện vẫn có trọng lượng. Cho chút mặt mũi, mọi người đều dễ sống. Không cho mặt mũi...」 Hắn chưa nói hết, nhưng thanh mã tấu dưới ánh mặt trời đang tỏa ra hàn quang lạnh lẽo.|none|Thị tập|none|none

Ngươi thầm nghĩ: 「Chết tiệt, kẻ đục nước béo cò tới rồi.」 Ngươi chạm vào chuôi kiếm bên hông, âm thầm đếm số lượng đối phương —— bảy tên, đều mang theo vũ khí. Ngươi và Vũ Chúc cộng lại hai người, đánh nhau thì chắc chắn thắng, nhưng đây là địa bàn của Hạp Lục Châu, Thiên Sơn phái không tiện công khai xung đột với những thế lực địa phương, hơn nữa sau lưng đối phương nói không chừng còn có người Đảng Hạng chống lưng. Ngươi đang tính toán đối sách, Vũ Chúc đột nhiên lên tiếng.|Vũ Chúc|Thị tập|Nghiêm túc|none

「Để muội trả.」 Giọng nàng rất nhẹ, nhưng trong đám đông ồn ào lại nghe vô cùng rõ rệt. Mọi người đều quay đầu nhìn nàng —— thiếu nữ tóc vàng mắt xanh, sau lưng mang đôi cánh vũ này, đang tháo sợi tố đai màu xanh bên hông xuống. 「Trong tay Vũ nhi có chút tiền,」 Nàng cúi đầu, giọng nói hơi run rẩy, 「Chắc là... chắc là đủ để mua thuốc cho muội muội của A Ngưu...」|Vũ Chúc|Thị tập|Phân vân|none

Ngươi ngẩn người. Ngươi biết đó là số tiền tiêu vặt nàng tích cóp suốt hai năm, vốn định mua một sợi dây buộc tóc thật đẹp, nhưng luôn không nỡ tiêu. Nàng từng chỉ vào sợi dây buộc tóc ở hội chợ và nói với bạn: 「Đợi Vũ nhi để dành đủ tiền, sẽ mua sợi dây đẹp nhất đó, buộc lên tóc, cô nhỏ chắc chắn sẽ khen Vũ nhi xinh đẹp cho mà xem!」|Vũ Chúc|Thị tập|Đau buồn|none
</MAIN_TEXT>

<SUMMARY>
Đối mặt với lựa chọn lưỡng nan, quan niệm thiện ác của Vũ Chúc hoàn toàn sụp đổ. Tệ hơn nữa, tên lưu manh Lý Tam đục nước béo cò xuất hiện, muốn tống tiền đống dưa của Vương đại gia. Vũ Chúc đưa ra quyết định —— dùng số tiền tích góp suốt hai năm của mình để giải quyết tất cả những điều này.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Đối mặt với đám lưu manh đục nước béo cò, Vũ Chúc quyết định đem toàn bộ tiền túi ra để giải quyết tất cả —— nhưng liệu điều này có thực sự giải quyết được vấn đề?",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "10:30",
    "Người chơi": {
        "Thay đổi vị trí": "Thị tập"
    },
    "NPC hiện tại": {
        "Vũ Chúc": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Thị tập"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    {
        id: "Yuzhu_HamiOasis_Dilemma_4",
        name: "Vũ Chúc · Hạp Lục Châu 4",
        priority: 57,
        conditions: {
            currentSpecialEvent: { equals: 'Yuzhu_HamiOasis_Dilemma_3' }
        },
        effects: {},
        text: `< SLG_MODE >

<MAIN_TEXT>
Bên trong dải lụa là tất cả số tiền Vũ Chúc tích cóp được —— ba lượng bạc, những đồng tiền lẻ lẻ tẻ, còn có vài mảnh bạc nhỏ. Nàng đưa tiền cho bạn: 「Ca ca, giúp Vũ nhi đi mua thuốc cho muội muội của A Ngưu, được không?」 Sau đó, nàng tháo đôi linh đương bằng bạc bên tai xuống —— đó là quà sinh nhật Cơ Tự tặng cho nàng, nàng vẫn luôn đeo nó như báu vật. Tiếp đó, nàng cũng tháo sợi vòng tay bạc mà các trưởng lão cùng nhau góp tiền tặng ở cổ tay ra.|Vũ Chúc|Thị tập|Đau buồn|none

「Tiểu cô nương, cháu đây là...」 Vương đại gia ngẩn người. Vũ Chúc không nhìn lão, chỉ lặng lẽ đem từng món đồ đặt vào tay lão: 「Đủ chưa ạ?」 Giọng nàng hơi run, đôi mắt xanh thẳm phủ một tầng sương nước, 「Vũ nhi không còn gì nữa rồi... những thứ này cộng lại... chắc là đáng giá ba lượng bạc... ông cầm lấy đi mua thuốc cho cha mình...」 Vương đại gia nhận lấy trang sức, vẻ mặt vẫn còn đầy phẫn uất, nhưng dù sao cũng đã thả A Ngưu ra.|Vũ Chúc|Thị tập|Đau buồn|none

Đám lưu manh Lý Tam thấy cảnh này, biết rõ chẳng còn dầu mỡ gì để vớt, bèn chửi bới vài câu rồi tản đi. Ngươi và Vũ Chúc cùng đưa A Ngưu đến tiệm thuốc gần đó bốc thuốc. Vũ Chúc đưa thuốc cho A Ngưu: 「Mau về đi, muội muội ngươi đang đợi đấy.」 A Ngưu ngẩng đầu nhìn hai người một cái —— trong đôi mắt quật cường đó, có sự cảm kích, có sự hổ thẹn, còn có một loại cảm xúc phức tạp mà ngươi không hiểu nổi. Ngươi tưởng hắn sẽ nói một tiếng cảm ơn, hoặc dập đầu một cái, hoặc ít nhất là gật đầu. Nhưng đời không như là mơ. Hắn giật lấy túi thuốc, quay người chạy biến, không hề ngoảnh đầu lại, biến mất trong đám đông. Sau khi chạy đi được vài bước, ngươi lờ mờ nghe thấy hắn lầm bầm điều gì đó ——|none|Thị tập|none|none

「Đúng là đa sự.」|none|Thị tập|none|none

Ngươi ngẩn người tại chỗ, không biết nên phản ứng thế nào. Ngươi thầm nghĩ: 「Hành thiện không cầu báo đáp, nghe thì rất vĩ đại, nhưng nói cho cùng —— cũng giống như ném đá xuống giếng, nghe tiếng động xong, đến cả bọt nước cũng chẳng thấy đâu.」 Khi các ngươi quay lại sạp dưa, phát hiện Vương đại gia cũng đã đi rồi. Trên mặt đất chỉ còn lại sợi tố đai đó —— chắc là rơi trên đất bị giẫm bẩn nên Vương đại gia chê bẩn không lấy. Vũ Chúc ngồi xổm ở đó, nhặt dải lụa lên, dùng tay áo lau đi vết bùn đất trên đó.|Vũ Chúc|Thị tập|Đau buồn|none

「Đi thôi.」 Ngươi khẽ nói, 「Đến lúc phải về rồi.」 Vũ Chúc gật đầu, đứng dậy, đi theo sau lưng bạn. Nàng không còn tung tăng nhảy nhót như lúc mới đến, không còn líu lo trò chuyện, ngay cả đôi cánh cũng rủ xuống, giống như một chú chim nhỏ bị dầm mưa. Các ngươi ra khỏi hội chợ, bước lên con đường trở về, đi qua kênh tưới Thất Tuyền, đi qua ruộng dưa ruộng lúa, đi qua một ốc đảo. Nàng vẫn luôn không mở miệng.|Vũ Chúc|Lục châu|Đau buồn|none

Mặt trời ngả về tây, kéo dài bóng của hai người. Vũ Chúc đột ngột dừng bước. 「Ca ca.」 Giọng nàng rất khẽ, như sợ làm kinh động điều gì. 「Hửm?」 「Vũ nhi... có phải là làm sai rồi không?」 Nàng ngẩng đầu, đôi mắt xanh thẳm tràn đầy vẻ mê man và bất lực, 「Vũ nhi muốn giúp tất cả mọi người... nhưng... dường như chẳng giúp được ai cả. Vương đại gia vẫn rất tức giận, A Ngưu cũng không hề cảm ơn Vũ nhi... Vũ nhi đem tất cả mọi thứ ra hết rồi, nhưng dường như... chẳng có gì trở nên tốt đẹp cả.」|Vũ Chúc|Sơn đạo|Đau buồn|none

Ngươi không biết phải trả lời thế nào. Ngươi thầm nghĩ: 「Nàng nói đúng. Vương đại gia tuy nhận đồ, nhưng lúc đi vẫn lầm bầm 'xui xẻo', đến nửa câu cảm ơn cũng không có. A Ngưu lại càng trực tiếp mắng một câu 'đa sự'. Vũ Chúc đã hy sinh tất cả, nhưng lại chẳng đổi được gì.」|Vũ Chúc|Sơn đạo|Đau buồn|none

「Ca ca,」 Giọng Vũ Chúc càng lúc càng nhỏ, 「Cái gì mới là đúng? Cái gì mới là sai?」 Nàng cúi đầu, nhìn chằm chằm mũi chân mình, 「Trộm đồ là không đúng... nhưng nếu không trộm, muội muội của A Ngưu sẽ chết... người bị trộm cũng rât đáng thương... nhưng người trộm đồ cũng rất đáng thương...」 Giọng nàng bắt đầu run rẩy, 「Vũ nhi... không hiểu nổi nữa rồi...」|Vũ Chúc|Sơn đạo|Đau buồn|none
</MAIN_TEXT>

<SUMMARY>
Vũ Chúc dùng tất cả số tiền tích cóp và trang sắc quý giá của mình để giải quyết cục diện bế tắc trước mắt —— mua thuốc cho A Ngưu, bồi thường tổn thất cho Vương đại gia. Nhưng kết quả ngoài ý muốn: A Ngưu sau khi nhận thuốc mắng một câu "đa sự" rồi chạy mất, Vương đại gia lầm bầm "xui xẻo" cũng bỏ đi. Vũ Chúc hy sinh tất cả nhưng không ai biết ơn. Trên đường về, nàng cuối cùng cũng suy sụp.
</SUMMARY>

<SIDE_NOTE>
{
    "Sự kiện ngẫu nhiên": {
        "Loại sự kiện": "Sự kiện lựa chọn",
        "Mô tả sự kiện": "Vũ Chúc đã trao đi lòng tốt, nhưng kết quả nhận lại chẳng như ý nguyện, nàng rơi vào sự hoang mang sâu sắc",
        "Tùy chọn 1": {
            "Mô tả": "Cốt truyện đặc biệt: Tiếp tục",
            "Phần thưởng": "",
            "Tỷ lệ thành công": "100%"
        }
    },
    "Thời gian": "16:00",
    "Người chơi": {
        "Thay đổi vị trí": "Sơn đạo"
    },
    "NPC hiện tại": {
        "Vũ Chúc": {
            "Thay đổi hảo cảm": "Không đổi",
            "Thay đổi vị trí": "Sơn đạo"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    {
        id: "Yuzhu_HamiOasis_Dilemma_5",
        name: "Vũ Chúc · Hạp Lục Châu 5",
        priority: 56,
        conditions: {
            currentSpecialEvent: { equals: 'Yuzhu_HamiOasis_Dilemma_4' }
        },
        effects: {
            GameMode: { set: 0 },
            inputEnable: { set: 1 },
            mapLocation: { set: 'Thiên Sơn phái' },
            companionNPC: { set: [] },
            userLocation: { set: 'tianshanpai' },
            "playerTalents.心性": { add: 1 }
        },
        text: `< SLG_MODE >

<MAIN_TEXT>
Nàng ngồi thụp xuống, bó gối lại, vùi mặt vào trong cánh tay. Đôi cánh vũ lực rũ xuống, dưới ráng chiều tà tỏa ra ánh hào quang nhàn nhạt. Ngươi đứng bên cạnh nàng, không biết nên nói gì cho phải. Một lúc sau, giọng nói lý nhí của nàng truyền ra từ sau cánh tay: 「Ca ca... Vũ nhi nói với ca ca một bí mật, được không?」 「Được.」

「Thật ra... Vũ nhi cũng là được nhặt về.」 Nàng không ngẩng đầu, giọng nói giống như từ một nơi rất xa vọng lại, 「Thúc phụ nói, Vũ nhi được tìm thấy trong một ngôi làng bị mã phỉ cướp phá. Cả làng đều chết hết rồi... chỉ có một mình Vũ nhi còn sống sót.」 Nàng khựng lại một lát, 「Nếu... nếu lúc đó không có trưởng lão đi ngang qua, không có Thiên Sơn phái... Vũ nhi có lẽ cũng sẽ biến thành người như A Ngưu.」 Ngươi ngẩn người. Ngươi chưa bao giờ nghe nàng nhắc về những điều này. Ở Thiên Sơn phái, nàng luôn cười híp mắt, giống như một chú chim nhỏ vui vẻ, như quả đào hạnh phúc của mọi người —— ngươi chưa bao giờ nghĩ tới, chú chim nhỏ này vốn dĩ cũng từng là một chú chim non bị dầm mưa trong cơn bão lớn, đang chờ đợi cái chết hoặc sự cứu rỗi giữa đống đổ nát.

「Vũ nhi và A Ngưu, thật ra là cùng một loại người.」 Giọng nàng nhẹ hơn rồi, nhẹ như một tiếng thở dài, 「Chỉ là Vũ nhi may mắn hơn... được nhặt về Thiên Sơn phái...」 Cuối cùng nàng cũng ngẩng đầu lên, đôi mắt xanh thẳm tràn đầy nước mắt, nhưng vẫn quật cường không để chúng rơi xuống: 「Nhưng Vũ nhi đã giúp hắn... tại sao hắn lại không vui? Vũ nhi làm sai điều gì sao?」

「Vũ nhi,」 Ngươi mở miệng, nhưng lại thấy mình chẳng biết nên nói gì. Ngươi im lặng một lát, đưa tay ra, nhẹ nhàng xoa đầu nàng. Nàng ngẩn ra một lát, rồi giống như một con thú nhỏ bị thương, nhào vào lòng bạn, ôm chặt lấy bạn, vùi mặt vào ngực bạn. Đôi cánh vũ khép lại sau lưng bạn, như muốn bao bọc lấy cả hai người. Ngươi cảm nhận được một mảnh ấm nóng trước ngực —— đó là nước mắt của nàng.

「Vũ nhi mệt quá...」 Giọng nàng lí nhí, mang theo tiếng nức nở, 「Cái gì cũng không hiểu nữa rồi... Ca ca, ca ca có thể ôm Vũ nhi một cái không?」

Ngươi không nói gì, chỉ ôm lấy nàng chặt hơn một chút. Ráng chiều tà kéo dài bóng của hai người, như hai người đang ôm khăng khít lấy nhau. Đỉnh núi tuyết Thiên Sơn đằng xa trong ráng chiều tỏa ra ánh kim hồng rực rỡ, giống như con đường thiên đàng mà thần minh đã trải sẵn. Gió từ phía núi tuyết thổi tới, mang theo một tia lành lạnh, cũng mang theo hơi thở từ phương xa. Các ngươi cứ thế ôm nhau thật lâu. Đợi đến khi Vũ Chúc cuối cùng cũng từ trong lòng bạn ngẩng đầu lên, đôi mắt đã đỏ hoe như hai hạt óc chó. Nàng dùng tay áo lau loạn xạ lên mặt, sụt sịt mũi, cố gắng nặn ra một nụ cười: 「Cảm ơn ca ca... Vũ nhi thấy ổn hơn rồi.」 Nàng khựng lại, rồi bồi thêm một câu: 「Tuy rằng vẫn chẳng hiểu gì cả... nhưng... có ca ca ở đây, Vũ nhi không sợ nữa rồi.」

Nàng vươn vai một cái, đôi cánh cũng theo đó mà vươn ra, dưới ráng chiều tỏa ánh hào quang màu thanh biếc. Nàng quay đầu lại, nghiêng đầu nhìn bạn: 「Ca ca, chúng ta về nhà thôi? Vũ nhi muốn ăn sườn xào chua ngọt An Mộ làm rồi... hơn nữa, Vũ nhi phải để dành tiền mua sợi dây buộc tóc mới —— sợi đẹp hơn cái hồi nãy nhìn thấy nhiều!」 Đôi mắt nàng lại sáng lên, tuy rằng vành mắt vẫn còn đỏ, nhưng cái khí thế đó đã quay trở lại rồi.

Ngươi thầm nghĩ: 「Cái con nhóc này... phục hồi cũng nhanh thật đấy.」 Ngươi phủi sạch bụi đất trên người, đi theo sau lưng nàng hướng về phía núi. Nàng đi phía trước, tung tăng nhảy nhót, mái tóc vàng dài nhảy múa dưới ráng chiều. Đi được vài bước, nàng đột ngột quay đầu lại: 「Ca ca, lần sau lại đưa Vũ nhi xuống núi được không? Vũ nhi vẫn muốn ăn dưa Hạp Lục Châu —— cái đó thực sự rất ngọt rất ngọt đó!」

Ngươi không trả lời, chỉ mỉm cười lắc đầu. Ngươi thầm nghĩ: 「Con nhóc này đúng là vôt tâm vô tính —— không, không đúng.」 Ngươi nhìn bóng lưng nàng, nhìn đôi cánh thanh vũ rập rờn dưới ráng chiều, nhớ lại lời nàng đã nói: Vũ nhi và A Ngưu là cùng một loại người. Đúng vậy, đều là những đứa trẻ mồ côi bị định mệnh ruồng bỏ, đều là những kẻ sống sót sau đống đổ nát. Điểm khác biệt nằm ở chỗ nàng chọn tin vào lòng tốt, còn hắn chọn tin vào sự phẫn nộ. 「Còn về hành thiện có ý nghĩa hay không...」 Ngươi ngẩng đầu nhìn về phía đỉnh núi tuyết Thiên Sơn đằng xa. 「Có lẽ, làm rồi mới biết được.」
</MAIN_TEXT>

<SUMMARY>
Vũ Chúc bộc bạch với bạn về thân thế trẻ mồ côi được nhặt về của mình, khóc lóc hỏi bạn "hành thiện thực sự có ý nghĩa sao". Ngươi ôm nàng, cùng nàng vượt qua khoảnh khắc gian khó này. Cuối cùng nàng lau khô nước mắt, nói chỉ cần có bạn ở đây nàng sẽ không sợ nữa, lại bắt đầu lẩm bẩm muốn ăn sườn xào chua ngọt và để dành tiền mua dây buộc tóc mới. Ngươi nhận ra bản chất thiện lương của nàng.
</SUMMARY>

<SIDE_NOTE>
{
    "Thời gian": "17:30",
    "Người chơi": {
        "Thay đổi vị trí": "không có"
    },
    "NPC hiện tại": {
        "Vũ Chúc": {
            "Thay đổi hảo cảm": "Tăng mạnh",
            "Thay đổi vị trí": "Sơn môn"
        }
    }
}
</SIDE_NOTE>

</SLG_MODE > `
    },

    // ==================== Sự kiện ví dụ: Tiền Đường Quân hảo cảm kích hoạt ====================
    {
        id: "event_qiantangjun_invitation",
        name: "Tiền Đường Quân mời xuống núi",
        priority: 20,
        conditions: {
            currentWeek: { min: 999 },           // Ít nhất tuần thứ 5 (giả định theo logic cũ nhưng hiện tại để 999 làm ví dụ)
            "npcFavorability.C": { min: 100 }   // Hảo cảm Tiền Đường Quân ≥ 100
        },
        effects: {
            "playerStats.声望": { add: 3 }     // Danh vọng + 3
        },
        text: `< SLG_MODE >
<MAIN_TEXT>
Sáng sớm, ngươi vừa định ra khỏi cửa thì bị một thân ảnh quen thuộc chặn ngay lối vào.

「Hế!」 Tiền Đường Quân cười hì hì đứng trước mặt bạn, trên tay xách một cái tay nải, 「Ta đã xin phép chị rồi, hôm nay chúng ta xuống núi chơi!」

「Xuống núi?」 Ngươi có chút bất ngờ, 「Chuyện này... có hợp lý không?」

「Có gì mà không hợp lý!」 Tiền Đường Quân không đợi bạn phản ứng đã nắm lấy tay bạn lôi ra ngoài, 「Ta sắp xếp xong cả rồi! Hội chợ dưới núi hôm nay có hội đền, náo nhiệt lắm! Hơn nữa, suốt ngày ru rú trên núi luyện công, không đổ bệnh mới là lạ đó!」

Ngươi bất lực bị nàng lôi đi, thầm nghĩ cái con nhỏ bạn xấu cùng nhau lớn lên này, vẫn cứ trước sau như một, thích làm gì thì làm...

Nhưng nói đi cũng phải nói lại, thỉnh thoảng thả lỏng một chút, dường như cũng không tệ?
</MAIN_TEXT>

<SUMMARY>
Tiền Đường Quân mời {{user}} xuống núi dạo hội chợ, không đợi {{user}} phản ứng đã lôi {{user}} xuất phát. Đây là lần đầu tiên hai người cùng nhau ra ngoài kể từ khi {{user}} nhập môn.
</SUMMARY>

<SIDE_NOTE>
{
    "Người chơi": {
        "Thay đổi vị trí": "Sơn môn"
    },
    "NPC hiện tại": {
        "Tiền Đường Quân": {
            "Thay đổi hảo cảm": "Tăng lên",
            "Thay đổi vị trí": "Sơn môn"
        }
    }
}
</SIDE_NOTE>
</SLG_MODE > `
    },

    // ==================== 测试事件集 ====================
    // 以下事件用于调试，覆盖各种条件和效果类型

    //     // 【测试1】条件: equals字符串 + 效果: set字符串
    //     {
    //         id: "test_string_equals_set",
    //         name: "[测试] 字符串条件与设置",
    //         priority: 100,  // 高优先级，方便测试
    //         conditions: {
    //             mapLocation: { equals: '天山派' },  // 条件: 地点等于"天山派"
    //             currentWeek: { min: 2 }              // 条件: 至少第2周
    //         },
    //         effects: {
    //             mapLocation: { set: '天山派后山' },  // 效果: 地点变为"天山派后山"
    //             userLocation: '后山'                  // 效果: 直接赋值字符串
    //         },
    //         text: `< SLG_MODE >
    // <MAIN_TEXT>
    // 【测试事件】字符串条件与设置测试

    // 这是一个测试事件，用于验证：
    // - 条件: mapLocation equals "天山派" ✓
    // - 效果: mapLocation 设置为 "天山派后山"
    // - 效果: userLocation 直接赋值为 "后山"
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试2】条件: max + 效果: add数值
    //     {
    //         id: "test_max_condition_add",
    //         name: "[测试] 最大值条件与加法效果",
    //         priority: 99,
    //         conditions: {
    //             currentWeek: { min: 2, max: 10 },    // 条件: 周数在2-10之间
    //             playerMood: { max: 80 }               // 条件: 体力不超过80
    //         },
    //         effects: {
    //             playerMood: { add: 10 },              // 效果: 体力+10
    //             "playerStats.金钱": { add: 100 }      // 效果: 金钱+100
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】最大值条件与加法效果测试

    // 这是一个测试事件，用于验证：
    // - 条件: currentWeek 在 2-10 之间 ✓
    // - 条件: playerMood ≤ 80 ✓
    // - 效果: playerMood +10
    // - 效果: playerStats.金钱 +100
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试3】条件: in数组 + 效果: multiply乘法
    //     {
    //         id: "test_in_condition_multiply",
    //         name: "[测试] in条件与乘法效果",
    //         priority: 98,
    //         conditions: {
    //             currentWeek: { in: [3, 6, 9, 12] },  // 条件: 周数在指定数组中
    //             difficulty: { in: ['easy', 'normal'] } // 条件: 难度在指定数组中
    //         },
    //         effects: {
    //             "playerStats.武学": { multiply: 1.5 }  // 效果: 武学×1.5
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】in条件与乘法效果测试

    // 这是一个测试事件，用于验证：
    // - 条件: currentWeek 在 [3, 6, 9, 12] 中 ✓
    // - 条件: difficulty 在 ["easy", "normal"] 中 ✓
    // - 效果: playerStats.武学 ×1.5
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试4】条件: notEquals + 效果: push数组
    //     {
    //         id: "test_notequals_push",
    //         name: "[测试] notEquals条件与数组push",
    //         priority: 97,
    //         conditions: {
    //             currentWeek: { min: 2 },
    //             GameMode: { notEquals: 1 }            // 条件: 游戏模式不等于1
    //         },
    //         effects: {
    //             companionNPC: { push: '钱塘君' }      // 效果: 向随行NPC数组添加"钱塘君"
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】notEquals条件与数组push测试

    // 这是一个测试事件，用于验证：
    // - 条件: GameMode ≠ 1 ✓
    // - 效果: companionNPC.push("钱塘君")
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试5】效果: remove数组元素
    //     {
    //         id: "test_remove_from_array",
    //         name: "[测试] 数组remove操作",
    //         priority: 96,
    //         conditions: {
    //             currentWeek: { min: 3 }
    //             // 注意：需要确保companionNPC数组中已有"钱塘君"才能测试remove
    //         },
    //         effects: {
    //             companionNPC: { remove: '钱塘君' }    // 效果: 从随行NPC数组移除"钱塘君"
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】数组remove操作测试

    // 这是一个测试事件，用于验证：
    // - 效果: companionNPC.remove("钱塘君")
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试6】效果: concat合并数组
    //     {
    //         id: "test_concat_array",
    //         name: "[测试] 数组concat操作",
    //         priority: 95,
    //         conditions: {
    //             currentWeek: { equals: 5 }
    //         },
    //         effects: {
    //             companionNPC: { concat: ['洞庭君', '破阵子'] }  // 效果: 合并多个NPC到数组
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】数组concat操作测试

    // 这是一个测试事件，用于验证：
    // - 效果: companionNPC.concat(["洞庭君", "破阵子"])
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试7】多层嵌套路径 + 多种效果组合
    //     {
    //         id: "test_nested_path_combo",
    //         name: "[测试] 嵌套路径与组合效果",
    //         priority: 94,
    //         conditions: {
    //             "npcFavorability.A": { min: 10 },     // 破阵子好感≥10
    //             "npcFavorability.B": { min: 10 },     // 洞庭君好感≥10
    //             "playerStats.武学": { min: 30 }       // 武学≥30
    //         },
    //         effects: {
    //             "npcFavorability.A": { add: 5 },      // 破阵子好感+5
    //             "npcFavorability.B": { add: 5 },      // 洞庭君好感+5
    //             "playerTalents.悟性": { add: 2 },     // 悟性+2
    //             "playerStats.声望": { add: 10 },      // 声望+10
    //             "combatStats.攻击力": { add: 5 }      // 攻击力+5
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】嵌套路径与组合效果测试

    // 这是一个测试事件，用于验证多个嵌套路径的读取和设置：
    // - 条件: npcFavorability.A ≥ 10 ✓
    // - 条件: npcFavorability.B ≥ 10 ✓
    // - 条件: playerStats.武学 ≥ 30 ✓
    // - 效果: npcFavorability.A +5
    // - 效果: npcFavorability.B +5
    // - 效果: playerTalents.悟性 +2
    // - 效果: playerStats.声望 +10
    // - 效果: combatStats.攻击力 +5
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试8】设置顶层变量
    //     {
    //         id: "test_set_top_level_vars",
    //         name: "[测试] 设置顶层变量",
    //         priority: 93,
    //         conditions: {
    //             currentWeek: { equals: 6 }
    //         },
    //         effects: {
    //             GameMode: { set: 1 },                 // 设置游戏模式为1
    //             randomEvent: { set: 0 },              // 重置随机事件标记
    //             battleEvent: { set: 0 },              // 重置战斗事件标记
    //             actionPoints: { set: 3 },             // 设置行动点为3
    //             enamor: { set: 0 }                    // 重置魅惑值
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】设置顶层变量测试

    // 这是一个测试事件，用于验证顶层变量的设置：
    // - 效果: GameMode = 1
    // - 效果: randomEvent = 0
    // - 效果: battleEvent = 0
    // - 效果: actionPoints = 3
    // - 效果: enamor = 0
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试9】无效果事件（仅发送文本）
    //     {
    //         id: "test_text_only",
    //         name: "[测试] 仅文本无效果",
    //         priority: 92,
    //         conditions: {
    //             currentWeek: { equals: 7 }
    //         },
    //         effects: {},  // 无任何效果
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】仅文本无效果测试

    // 这是一个测试事件，用于验证：
    // - 事件可以没有任何效果
    // - 仅发送预设文本
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功，无属性变化。</SUMMARY>
    // </SLG_MODE>`
    //     },

    //     // 【测试10】背包道具操作
    //     {
    //         id: "test_inventory_operation",
    //         name: "[测试] 背包道具操作",
    //         priority: 91,
    //         conditions: {
    //             currentWeek: { equals: 8 }
    //         },
    //         effects: {
    //             "inventory.大力丸": { add: 3 },       // 大力丸+3
    //             "inventory.金疮药": { add: 5 },       // 金疮药+5
    //             "inventory.丹参": { set: 10 }         // 丹参设为10
    //         },
    //         text: `<SLG_MODE>
    // <MAIN_TEXT>
    // 【测试事件】背包道具操作测试

    // 这是一个测试事件，用于验证背包操作：
    // - 效果: inventory.大力丸 +3
    // - 效果: inventory.金疮药 +5
    // - 效果: inventory.丹参 = 10
    // </MAIN_TEXT>
    // <SUMMARY>测试事件触发成功。</SUMMARY>
    // </SLG_MODE>`
    //     }

    // ==================== 在此添加更多事件 ====================
    // 复制上面的模板，修改 id、conditions、effects 和 text
];

// ==================== 工具函数 ====================

/**
 * 根据路径获取变量值
 * 支持嵌套路径，如 "npcFavorability.C" 或 "playerStats.声望"
 * @param {string} path - 变量路径
 * @returns {any} 变量值
 */
function getValueByPath(path) {
    const parts = path.split('.');

    // 定义可访问的全局变量映射
    // 注意：这些变量需要在运行时可访问
    const globalVars = {
        currentWeek: typeof currentWeek !== 'undefined' ? currentWeek : undefined,
        playerMood: typeof playerMood !== 'undefined' ? playerMood : undefined,
        actionPoints: typeof actionPoints !== 'undefined' ? actionPoints : undefined,
        GameMode: typeof GameMode !== 'undefined' ? GameMode : undefined,
        difficulty: typeof difficulty !== 'undefined' ? difficulty : undefined,
        enamor: typeof enamor !== 'undefined' ? enamor : undefined,
        newWeek: typeof newWeek !== 'undefined' ? newWeek : undefined,
        randomEvent: typeof randomEvent !== 'undefined' ? randomEvent : undefined,
        battleEvent: typeof battleEvent !== 'undefined' ? battleEvent : undefined,
        mapLocation: typeof mapLocation !== 'undefined' ? mapLocation : undefined,
        userLocation: typeof userLocation !== 'undefined' ? userLocation : undefined,
        seasonStatus: typeof seasonStatus !== 'undefined' ? seasonStatus : undefined,
        dayNightStatus: typeof dayNightStatus !== 'undefined' ? dayNightStatus : undefined,
        companionNPC: typeof companionNPC !== 'undefined' ? companionNPC : undefined,
        npcFavorability: typeof npcFavorability !== 'undefined' ? npcFavorability : undefined,
        playerTalents: typeof playerTalents !== 'undefined' ? playerTalents : undefined,
        playerStats: typeof playerStats !== 'undefined' ? playerStats : undefined,
        combatStats: typeof combatStats !== 'undefined' ? combatStats : undefined,
        martialArts: typeof martialArts !== 'undefined' ? martialArts : undefined,
        inventory: typeof inventory !== 'undefined' ? inventory : undefined,
        equipment: typeof equipment !== 'undefined' ? equipment : undefined,
        npcVisibility: typeof npcVisibility !== 'undefined' ? npcVisibility : undefined,
        npcGiftGiven: typeof npcGiftGiven !== 'undefined' ? npcGiftGiven : undefined,
        npcSparred: typeof npcSparred !== 'undefined' ? npcSparred : undefined,
        triggeredEvents: typeof triggeredEvents !== 'undefined' ? triggeredEvents : undefined,
        currentSpecialEvent: typeof currentSpecialEvent !== 'undefined' ? currentSpecialEvent : undefined,
        inputEnable: typeof inputEnable !== 'undefined' ? inputEnable : undefined
    };

    let value = globalVars[parts[0]];

    // 逐层访问嵌套属性
    for (let i = 1; i < parts.length && value !== undefined; i++) {
        value = value[parts[i]];
    }

    return value;
}

/**
 * 根据路径设置变量值
 * @param {string} path - 变量路径
 * @param {any} newValue - 新值
 */
function setValueByPath(path, newValue) {
    const parts = path.split('.');
    const oldValue = getValueByPath(path);

    console.log(`[SpecialEvent] 设置变量: ${path}`);
    console.log(`[SpecialEvent]   旧值: ${JSON.stringify(oldValue)}`);
    console.log(`[SpecialEvent]   新值: ${JSON.stringify(newValue)}`);

    if (parts.length === 1) {
        // 顶层变量，需要特殊处理（使用 eval 或 window 对象在某些环境可能不可靠，这里用 switch）
        switch (parts[0]) {
            case 'currentWeek': currentWeek = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 currentWeek`); break;
            case 'playerMood': playerMood = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 playerMood`); break;
            case 'actionPoints': actionPoints = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 actionPoints`); break;
            case 'GameMode': GameMode = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 GameMode`); break;
            case 'difficulty': difficulty = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 difficulty`); break;
            case 'enamor': enamor = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 enamor`); break;
            case 'newWeek': newWeek = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 newWeek`); break;
            case 'randomEvent': randomEvent = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 randomEvent`); break;
            case 'battleEvent': battleEvent = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 battleEvent`); break;
            case 'mapLocation': mapLocation = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 mapLocation`); break;
            case 'userLocation': userLocation = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 userLocation`); break;
            case 'seasonStatus': seasonStatus = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 seasonStatus`); break;
            case 'dayNightStatus': dayNightStatus = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 dayNightStatus`); break;
            case 'companionNPC': companionNPC = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 companionNPC`); break;
            case 'inputEnable': inputEnable = newValue; console.log(`[SpecialEvent]   ✓ 已设置顶层变量 inputEnable`); if (typeof updateFreeActionInputState === 'function') { updateFreeActionInputState(); } break;
            default:
                console.warn(`[SpecialEvent]   ✗ 无法设置顶层变量: ${parts[0]}（未在支持列表中）`);
        }
    } else {
        // 嵌套变量
        const globalVars = {
            npcFavorability: typeof npcFavorability !== 'undefined' ? npcFavorability : null,
            npcVisibility: typeof npcVisibility !== 'undefined' ? npcVisibility : null,
            playerTalents: typeof playerTalents !== 'undefined' ? playerTalents : null,
            playerStats: typeof playerStats !== 'undefined' ? playerStats : null,
            combatStats: typeof combatStats !== 'undefined' ? combatStats : null,
            martialArts: typeof martialArts !== 'undefined' ? martialArts : null,
            inventory: typeof inventory !== 'undefined' ? inventory : null,
            equipment: typeof equipment !== 'undefined' ? equipment : null
        };

        let obj = globalVars[parts[0]];
        if (!obj) {
            console.warn(`[SpecialEvent]   ✗ 未找到对象: ${parts[0]}`);
            return;
        }

        // 遍历到倒数第二层
        for (let i = 1; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
            if (obj === undefined) {
                console.warn(`[SpecialEvent]   ✗ 路径不存在: ${path}`);
                return;
            }
        }

        // 设置最后一层的值
        obj[parts[parts.length - 1]] = newValue;
        console.log(`[SpecialEvent]   ✓ 已设置嵌套变量 ${path}`);
    }
}

/**
 * 检查单个条件是否满足
 * @param {any} value - 当前值
 * @param {object} condition - 条件对象
 * @param {string} path - 变量路径（用于日志）
 * @returns {boolean} 是否满足条件
 */
function checkCondition(value, condition, path = '') {
    const logPrefix = `[SpecialEvent] 条件检查 [${path}]:`;

    if (value === undefined) {
        console.log(`${logPrefix} 值为undefined，条件不满足`);
        return false;
    }

    // 检查 min 条件
    if (condition.min !== undefined) {
        const result = value >= condition.min;
        console.log(`${logPrefix} ${value} >= ${condition.min} (min) → ${result ? '✓' : '✗'}`);
        if (!result) return false;
    }

    // 检查 max 条件
    if (condition.max !== undefined) {
        const result = value <= condition.max;
        console.log(`${logPrefix} ${value} <= ${condition.max} (max) → ${result ? '✓' : '✗'}`);
        if (!result) return false;
    }

    // 检查 equals 条件
    if (condition.equals !== undefined) {
        const result = value === condition.equals;
        console.log(`${logPrefix} ${JSON.stringify(value)} === ${JSON.stringify(condition.equals)} (equals) → ${result ? '✓' : '✗'}`);
        if (!result) return false;
    }

    // 检查 in 条件
    if (condition.in !== undefined) {
        const result = condition.in.includes(value);
        console.log(`${logPrefix} ${JSON.stringify(value)} in ${JSON.stringify(condition.in)} → ${result ? '✓' : '✗'}`);
        if (!result) return false;
    }

    // 检查 notEquals 条件
    if (condition.notEquals !== undefined) {
        const result = value !== condition.notEquals;
        console.log(`${logPrefix} ${JSON.stringify(value)} !== ${JSON.stringify(condition.notEquals)} (notEquals) → ${result ? '✓' : '✗'}`);
        if (!result) return false;
    }

    return true;
}

/**
 * 检查事件的所有条件是否满足
 * @param {object} event - 事件对象
 * @returns {boolean} 是否满足所有条件
 */
function checkEventConditions(event) {
    console.log(`\n[SpecialEvent] ========== 检查事件: ${event.name} (${event.id}) ==========`);

    // 检查是否已触发过
    if (triggeredEvents && triggeredEvents.includes(event.id)) {
        console.log(`[SpecialEvent] → 事件已触发过，跳过`);
        return false;
    }

    console.log(`[SpecialEvent] 事件条件数量: ${Object.keys(event.conditions).length}`);

    // 检查所有条件
    let allConditionsMet = true;
    for (const [path, condition] of Object.entries(event.conditions)) {
        const value = getValueByPath(path);
        console.log(`[SpecialEvent] 读取变量 ${path} = ${JSON.stringify(value)}`);
        if (!checkCondition(value, condition, path)) {
            console.log(`[SpecialEvent] → 条件不满足，事件不触发`);
            allConditionsMet = false;
            break;
        }
    }

    if (allConditionsMet) {
        console.log(`[SpecialEvent] → 所有条件满足！事件将被触发`);
    }

    return allConditionsMet;
}

/**
 * 应用事件效果（修改游戏变量）
 * 支持的操作类型：
 * - { add: number } - 加法操作（数值类型）
 * - { set: any } - 直接设置为指定值（任意类型：数值、字符串、数组等）
 * - { multiply: number } - 乘法操作（数值类型）
 * - { push: any } - 向数组末尾添加元素
 * - { remove: any } - 从数组中移除元素
 * - { concat: array } - 将数组与另一个数组合并
 * - 直接赋值 - 非对象值直接赋值
 *
 * @param {object} event - 事件对象
 */
function applyEventEffects(event) {
    console.log(`\n[SpecialEvent] ========== 应用事件效果: ${event.name} ==========`);

    if (!event.effects || Object.keys(event.effects).length === 0) {
        console.log(`[SpecialEvent] 该事件无效果需要应用`);
        return;
    }

    console.log(`[SpecialEvent] 效果数量: ${Object.keys(event.effects).length}`);

    for (const [path, effect] of Object.entries(event.effects)) {
        const currentValue = getValueByPath(path);
        let newValue;
        let skipSet = false;  // 标记是否跳过设置（用于 push/remove 等就地修改操作）
        let operationType = '';

        console.log(`\n[SpecialEvent] 处理效果: ${path}`);
        console.log(`[SpecialEvent]   当前值: ${JSON.stringify(currentValue)} (类型: ${Array.isArray(currentValue) ? 'array' : typeof currentValue})`);
        console.log(`[SpecialEvent]   效果定义: ${JSON.stringify(effect)}`);

        if (typeof effect === 'object' && effect !== null) {
            if (effect.add !== undefined) {
                // 加法操作（数值）
                operationType = 'add';
                newValue = (currentValue || 0) + effect.add;
                console.log(`[SpecialEvent]   操作类型: add（加法）`);
                console.log(`[SpecialEvent]   计算: ${currentValue || 0} + ${effect.add} = ${newValue}`);
            } else if (effect.set !== undefined) {
                // 直接设置（支持任意类型：字符串、数值、数组、对象等）
                operationType = 'set';
                newValue = effect.set;
                console.log(`[SpecialEvent]   操作类型: set（直接设置）`);
                console.log(`[SpecialEvent]   将设置为: ${JSON.stringify(newValue)}`);
            } else if (effect.multiply !== undefined) {
                // 乘法操作（数值）
                operationType = 'multiply';
                newValue = (currentValue || 0) * effect.multiply;
                console.log(`[SpecialEvent]   操作类型: multiply（乘法）`);
                console.log(`[SpecialEvent]   计算: ${currentValue || 0} × ${effect.multiply} = ${newValue}`);
            } else if (effect.push !== undefined) {
                // 向数组末尾添加元素
                operationType = 'push';
                console.log(`[SpecialEvent]   操作类型: push（数组添加）`);
                if (Array.isArray(currentValue)) {
                    console.log(`[SpecialEvent]   添加元素: ${JSON.stringify(effect.push)}`);
                    console.log(`[SpecialEvent]   数组操作前: ${JSON.stringify(currentValue)}`);
                    currentValue.push(effect.push);
                    console.log(`[SpecialEvent]   数组操作后: ${JSON.stringify(currentValue)}`);
                    console.log(`[SpecialEvent]   ✓ push 操作成功`);
                    skipSet = true;
                } else {
                    console.warn(`[SpecialEvent]   ✗ push 操作失败: ${path} 不是数组类型`);
                }
            } else if (effect.remove !== undefined) {
                // 从数组中移除元素
                operationType = 'remove';
                console.log(`[SpecialEvent]   操作类型: remove（数组移除）`);
                if (Array.isArray(currentValue)) {
                    console.log(`[SpecialEvent]   要移除的元素: ${JSON.stringify(effect.remove)}`);
                    console.log(`[SpecialEvent]   数组操作前: ${JSON.stringify(currentValue)}`);
                    const index = currentValue.indexOf(effect.remove);
                    if (index > -1) {
                        currentValue.splice(index, 1);
                        console.log(`[SpecialEvent]   数组操作后: ${JSON.stringify(currentValue)}`);
                        console.log(`[SpecialEvent]   ✓ remove 操作成功`);
                    } else {
                        console.log(`[SpecialEvent]   ⚠ 未找到要移除的元素`);
                    }
                    skipSet = true;
                } else {
                    console.warn(`[SpecialEvent]   ✗ remove 操作失败: ${path} 不是数组类型`);
                }
            } else if (effect.concat !== undefined) {
                // 将数组与另一个数组合并
                operationType = 'concat';
                console.log(`[SpecialEvent]   操作类型: concat（数组合并）`);
                if (Array.isArray(currentValue) && Array.isArray(effect.concat)) {
                    console.log(`[SpecialEvent]   要合并的数组: ${JSON.stringify(effect.concat)}`);
                    newValue = currentValue.concat(effect.concat);
                    console.log(`[SpecialEvent]   合并后: ${JSON.stringify(newValue)}`);
                } else {
                    console.warn(`[SpecialEvent]   ✗ concat 操作失败: 需要两个数组`);
                }
            } else {
                console.log(`[SpecialEvent]   ⚠ 未知的对象效果类型: ${JSON.stringify(effect)}`);
            }
        } else {
            // 直接赋值（非对象值）
            operationType = 'direct';
            newValue = effect;
            console.log(`[SpecialEvent]   操作类型: 直接赋值`);
            console.log(`[SpecialEvent]   将设置为: ${JSON.stringify(newValue)}`);
        }

        if (!skipSet && newValue !== undefined) {
            setValueByPath(path, newValue);
            console.log(`[SpecialEvent]   ✓ 效果已应用`);
        }
    }

    console.log(`\n[SpecialEvent] ========== 效果应用完成 ==========\n`);

    // 检查数值范围
    if (typeof checkAllValueRanges === 'function') {
        checkAllValueRanges();
    }
}

/**
 * 标记事件为已触发
 * @param {string} eventId - 事件ID
 */
function markEventTriggered(eventId) {
    if (!triggeredEvents) {
        triggeredEvents = [];
    }
    if (!triggeredEvents.includes(eventId)) {
        triggeredEvents.push(eventId);
        console.log(`[SpecialEvent] 事件已标记为触发: ${eventId}`);
    }
}

// ==================== 主要对外函数 ====================

/**
 * 检查是否有符合条件的特殊事件
 * 按优先级排序，返回第一个符合条件的事件
 * @returns {object|null} 符合条件的事件对象，或null
 */
function checkSpecialEvents() {
    // 按优先级降序排序
    const sortedEvents = [...specialEvents].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const event of sortedEvents) {
        if (checkEventConditions(event)) {
            console.log(`[SpecialEvent] 找到符合条件的事件: ${event.name} (${event.id})`);
            return event;
        }
    }

    return null;
}

/**
 * 触发特殊事件
 * 应用效果、标记已触发、发送预设文本
 * 与 handleMessageOutput 保持一致：更新 lastUserMessage、调用 /setvar、但不改变 newWeek
 * @param {object} event - 事件对象
 * @param {object} options - 可选参数
 * @param {boolean} options.fromSkipWeek - 是否由跳过一周按钮触发
 * @returns {Promise<boolean>} 是否成功触发
 */
async function triggerSpecialEvent(event, options = {}) {
    if (!event) {
        console.warn('[SpecialEvent] 事件对象为空');
        return false;
    }

    console.log(`[SpecialEvent] 开始触发事件: ${event.name} (${event.id})`);

    try {
        // 1. 构造用户消息：年月周、地点、特殊剧情名称
        const weekNum = typeof currentWeek !== 'undefined' ? currentWeek : 1;
        const year = Math.floor((weekNum - 1) / 48) + 1;
        const remainingWeeks = (weekNum - 1) % 48;
        const month = Math.floor(remainingWeeks / 4) + 1;
        const week = remainingWeeks % 4 + 1;
        const location = typeof mapLocation !== 'undefined' ? mapLocation : '未知地点';

        // 根据是否由跳过一周触发，构建不同的消息前缀
        let userMessage;
        if (options.fromSkipWeek) {
            userMessage = `Thời gian trôi qua một tuần, vào tuần ${week} tháng ${month} năm ${year}, {{user}} tại ${location} kích hoạt cốt truyện đặc biệt —— ${event.name}`;
        } else {
            userMessage = `Tuần ${week} tháng ${month} năm ${year}, {{user}} tại ${location} kích hoạt cốt truyện đặc biệt —— ${event.name}`;
        }

        // 2. 更新 lastUserMessage（与 handleMessageOutput 保持一致）
        if (typeof lastUserMessage !== 'undefined') {
            lastUserMessage = userMessage;
            console.log(`[SpecialEvent] Đã cập nhật lastUserMessage = "${userMessage}"`);
        }

        // 3. 调用 /setvar 保存到酒馆变量（与 handleMessageOutput 保持一致）
        if (typeof isInRenderEnvironment === 'function' && isInRenderEnvironment()) {
            const renderFunc = typeof getRenderFunction === 'function' ? getRenderFunction() : null;
            if (renderFunc) {
                console.log('[SpecialEvent] Lưu tin nhắn người dùng vào biến lastMessage_jxz');
                await renderFunc(`/setvar key=lastMessage_jxz ${userMessage}`);
            }
        }

        // Chú ý: Cốt truyện đặc biệt không làm thay đổi newWeek, giữ nguyên hiện trạng (Khác với handleMessageOutput)
        console.log('[SpecialEvent] newWeek giữ nguyên hiện trạng, không sửa đổi');

        // 4. 应用事件效果
        applyEventEffects(event);

        // 5. 设置当前特殊事件ID
        if (typeof currentSpecialEvent !== 'undefined') {
            currentSpecialEvent = event.id;
            console.log(`[SpecialEvent] Đã thiết lập currentSpecialEvent = "${event.id}"`);
        }

        // 6. 标记事件为已触发
        markEventTriggered(event.id);

        // 7. 保存游戏数据
        if (typeof saveGameData === 'function') {
            await saveGameData();
            console.log('[SpecialEvent] Dữ liệu trò chơi đã được lưu');
        }

        // 8. 发送预设文本（先注入用户输入，再发送AI回复）
        if (event.text && typeof isInRenderEnvironment === 'function' && isInRenderEnvironment()) {
            const renderFunc = typeof getRenderFunction === 'function' ? getRenderFunction() : null;
            if (renderFunc) {
                // 使用Promise方式延迟，保持在同一个async上下文中
                await new Promise(resolve => setTimeout(resolve, 500));

                // 确保变量完全同步到SillyTavern
                if (typeof saveGameData === 'function') {
                    await saveGameData();
                }
                await new Promise(resolve => setTimeout(resolve, 100));

                // Đầu tiên tiêm vào input người dùng (Nhất quán với handleMessageOutput)
                await renderFunc(`/inject id=10 position=chat depth=0 scan=true role=user ${userMessage}`);
                console.log(`[SpecialEvent] Input người dùng đã được tiêm vào: ${userMessage}`);

                // Sau đó gửi phản hồi định sẵn của AI
                const safeText = event.text
                    .replace(/\|/g, '\\|')   // Đầu tiên thoát ký tự ống dẫn
                    .replace(/`/g, '\\`');   // Sau đó thoát ký tự dấu ngoặc ngược
                await renderFunc(`/sendas name={{char}} at={{lastMessageId}}+1 ${safeText}`);
                console.log(`[SpecialEvent] Nội dung sự kiện đã được gửi: ${event.name}`);
                return true;
            }
        }

        // 非渲染环境，用弹窗显示
        if (typeof showModal === 'function' && !(typeof isInRenderEnvironment === 'function' && isInRenderEnvironment())) {
            showModal(`【Sự kiện đặc biệt】${event.name}<br><br>（Không phải môi trường SillyTavern, không thể gửi văn bản sự kiện.）`);
        }

        return true;
    } catch (error) {
        console.error('[SpecialEvent] 触发事件失败:', error);
        return false;
    }
}

/**
 * 获取所有已触发的事件ID列表
 * @returns {array} 已触发事件ID数组
 */
function getTriggeredEvents() {
    return triggeredEvents || [];
}

/**
 * 重置特定事件的触发状态（用于调试）
 * @param {string} eventId - 事件ID
 */
function resetEventTrigger(eventId) {
    if (triggeredEvents) {
        const index = triggeredEvents.indexOf(eventId);
        if (index > -1) {
            triggeredEvents.splice(index, 1);
            console.log(`[SpecialEvent] 事件触发状态已重置: ${eventId}`);
        }
    }
}

// 暴露到全局（供其他模块调用）
window.checkSpecialEvents = checkSpecialEvents;
window.triggerSpecialEvent = triggerSpecialEvent;
window.getTriggeredEvents = getTriggeredEvents;
window.resetEventTrigger = resetEventTrigger;