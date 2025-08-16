const SUPABASE_URL = 'https://avdxuubamsjuwwojqonb.supabase.co'
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZHh1dWJhbXNqdXd3b2pxb25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjI1MjcsImV4cCI6MjA3MDI5ODUyN30.KvZZyC44-0_scfXVv55S9DGskCFmBP378Ke_ZwUUi9w"
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 학번 저장 변수
let studentId = '';

// 페이지 로드시 학번 입력받기
window.addEventListener('load', function() {
    while (!studentId || studentId.trim() === '') {
        studentId = prompt('학번을 입력해주세요:');
        if (studentId === null) {
            // 사용자가 취소를 누른 경우
            alert('학번 입력이 필요합니다.');
        } else if (studentId.trim() === '') {
            alert('올바른 학번을 입력해주세요.');
        }
    }
    studentId = studentId.trim();
});

// 출석체크 버튼과 시간 표시 기능
const attendanceBtn = document.getElementById('attendanceBtn');
const timeDisplay = document.getElementById('timeDisplay');

attendanceBtn.addEventListener('click', async function() {
    if (!studentId || studentId.trim() === '') {
        alert('학번이 입력되지 않았습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    // 버튼 비활성화
    attendanceBtn.disabled = true;
    attendanceBtn.textContent = '출석체크 중...';
    
    try {
        const now = new Date();
        const currentTime = now.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 한국 시간으로 조정
        const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
        
        // Supabase에 출석 데이터 저장
        const { data, error } = await supabase
            .from('check')
            .insert([
                {
                    student_id: studentId,
                    created_at: koreaTime.toISOString()
                }
            ]);
        
        if (error) {
            throw error;
        }
        
        timeDisplay.innerHTML = `
            <div style="margin-bottom: 10px; color: green;"><strong>✅ 출석체크가 완료되었습니다!</strong></div>
            <div style="margin-bottom: 10px;"><strong>학번:</strong> ${studentId}</div>
            <div><strong>출석 시간:</strong> ${currentTime}</div>
        `;
        
        alert('출석체크가 완료되었습니다!');
        console.log('출석 기록 저장 성공:', data);
        
    } catch (error) {
        console.error('출석체크 오류:', error);
        timeDisplay.innerHTML = `
            <div style="color: red;"><strong>❌ 출석체크 실패: ${error.message}</strong></div>
        `;
        alert('출석체크에 실패했습니다: ' + error.message);
    } finally {
        // 버튼 다시 활성화
        attendanceBtn.disabled = false;
        attendanceBtn.textContent = '출석체크';
    }
});
