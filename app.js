// 출석 데이터 저장 (로컬)
const attendanceData = [];

const form = document.getElementById('attendanceForm');
const resultDiv = document.getElementById('result');
const statsDiv = document.getElementById('stats');

// 페이지 로드 시 오늘 날짜와 현재 시간 자동 입력
window.addEventListener('DOMContentLoaded', () => {
    // 매번 접속 시 학번 입력
    let studentId = '';
    while (!studentId) {
        studentId = prompt('학번을 입력하세요:');
    }
    form.studentId.value = studentId;
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    // 자동 기록
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const today = now.toISOString().slice(0, 10);
    const startTime = pad(now.getHours()) + ':' + pad(now.getMinutes());
    // 종료 시간은 2시간 후로 예시 기록 (실제 환경에 맞게 수정)
    const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const endTime = pad(endDate.getHours()) + ':' + pad(endDate.getMinutes());
    // 출석 코드 자동 생성 (예시: 랜덤 6자리)
    const attendanceCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const studentId = form.studentId.value.trim();

    // 기록 시각
    const recordDateTime = `${today} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // hidden input에 값 기록
    form.date.value = today;
    form.startTime.value = startTime;
    form.endTime.value = endTime;
    form.attendanceCode.value = attendanceCode;

    // 출석 데이터 저장
    attendanceData.push({
        studentId,
        date: today,
        startTime,
        endTime,
        attendanceCode,
        recordDateTime
    });

    resultDiv.textContent = `출석이 성공적으로 기록되었습니다!\n학번: ${studentId}\n출석 코드: ${attendanceCode}\n기록 시각: ${recordDateTime}`;
    updateStats();
});

function updateStats() {
    if (attendanceData.length === 0) {
        statsDiv.textContent = '아직 기록된 출석 데이터가 없습니다.';
        return;
    }
    let count = attendanceData.length;
    statsDiv.innerHTML = `총 출석: <b>${count}</b>회`;
}

function toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}
