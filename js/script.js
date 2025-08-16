const SUPABASE_URL = 'https://avdxuubamsjuwwojqonb.supabase.co'
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZHh1dWJhbXNqdXd3b2pxb25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjI1MjcsImV4cCI6MjA3MDI5ODUyN30.KvZZyC44-0_scfXVv55S9DGskCFmBP378Ke_ZwUUi9w"
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 학번 저장 변수
let studentId = '';


// 학번 입력 모달 관련 코드
function showStudentIdModal() {
    document.getElementById('studentIdModal').style.display = 'flex';
    document.getElementById('studentIdInput').value = '';
    document.getElementById('studentIdError').style.display = 'none';
}

function hideStudentIdModal() {
    document.getElementById('studentIdModal').style.display = 'none';
}

window.addEventListener('load', function() {
    if (!studentId || studentId.trim() === '') {
        showStudentIdModal();
    }
});

document.getElementById('studentIdSubmit').addEventListener('click', function() {
    const input = document.getElementById('studentIdInput').value;
    if (!input || input.trim() === '') {
        document.getElementById('studentIdError').textContent = '올바른 학번을 입력해주세요.';
        document.getElementById('studentIdError').style.display = 'block';
        return;
    }
    studentId = input.trim();
    hideStudentIdModal();
});

document.getElementById('studentIdInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('studentIdSubmit').click();
    }
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
        
        // 출석 가능 시간 체크 (16:00 ~ 23:59)
        const hour = now.getHours();
        if (hour < 16 || hour >= 24) {
            throw new Error('출석 가능 시간이 아닙니다. (오후 4시 ~ 오후 12시)');
        }
        
        // 현재 날짜의 시작 시간(오후 4시)과 종료 시간(다음날 0시) 설정
        const todayStart = new Date(now);
        todayStart.setHours(16, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(24, 0, 0, 0);
        
        // 중복 출석 체크
        const { data: existingCheck, error: checkError } = await supabase
            .from('check')
            .select('*')
            .eq('student_id', studentId)
            .gte('checkin_time', todayStart.toISOString())
            .lt('checkin_time', todayEnd.toISOString());
            
        if (checkError) throw checkError;
        
        if (existingCheck && existingCheck.length > 0) {
            timeDisplay.innerHTML = `
                <div style="color: orange;"><strong>⚠️ 이미 오늘 출석한 기록이 있습니다.</strong></div>
                <div style="margin-bottom: 10px;"><strong>학번:</strong> ${studentId}</div>
                <div><strong>출석 시간:</strong> ${existingCheck[0].checkin_time}</div>
            `;
            alert('이미 오늘 출석한 기록이 있습니다.');
            return;
        }
        const currentTime = now.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        // Supabase에 출석 데이터 저장
        const { data, error } = await supabase
            .from('check')
            .insert([
                {
                    student_id: studentId,
                    checkin_time: now.toISOString()
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

// 퇴실체크 버튼 기능
const checkoutBtn = document.getElementById('checkoutBtn');

checkoutBtn.addEventListener('click', async function() {
    // 퇴실할 학생의 학번 입력 받기
    let checkoutStudentId = prompt('퇴실할 학생의 학번을 입력해주세요:');
    
    if (!checkoutStudentId || checkoutStudentId.trim() === '') {
        alert('올바른 학번을 입력해주세요.');
        return;
    }
    
    checkoutStudentId = checkoutStudentId.trim();
    
    // 버튼 비활성화
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = '퇴실체크 중...';
    
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
        
        // 현재 날짜의 시작 시간(오후 4시)과 종료 시간(다음날 0시) 설정
        const todayStart = new Date(now);
        // 현재 시간이 오전 0시~오후 4시 사이라면 전날 오후 4시부터 자정까지를 검색
        if (now.getHours() < 16) {
            todayStart.setDate(todayStart.getDate() - 1);
        }
        todayStart.setHours(16, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setHours(24, 0, 0, 0);
        
        // 오늘의 출석 기록 확인
        const { data: todayCheck, error: checkError } = await supabase
            .from('check')
            .select('*')
            .eq('student_id', checkoutStudentId)
            .gte('checkin_time', todayStart.toISOString())
            .lt('checkin_time', todayEnd.toISOString())
            
        if (checkError) throw checkError;
        
        if (!todayCheck || todayCheck.length === 0) {
            throw new Error('오늘의 출석 기록이 없습니다.');
        }
        
        // 이미 퇴실 체크가 되어있는지 확인
        if (todayCheck[0].checkout_time !== null) {
            throw new Error('이미 퇴실 처리가 완료되었습니다.');
        }
        
        // 퇴실 시간 업데이트
        const { data, error } = await supabase
            .from('check')
            .update({ checkout_time: now.toISOString() })
            .eq('student_id', checkoutStudentId)
            .gte('checkin_time', todayStart.toISOString())
            .lt('checkin_time', todayEnd.toISOString());
        
        if (error) throw error;
        
        timeDisplay.innerHTML = `
            <div style="margin-bottom: 10px; color: green;"><strong>✅ 퇴실체크가 완료되었습니다!</strong></div>
            <div style="margin-bottom: 10px;"><strong>학번:</strong> ${checkoutStudentId}</div>
            <div><strong>퇴실 시간:</strong> ${currentTime}</div>
        `;
        
        alert('퇴실체크가 완료되었습니다!');
        console.log('퇴실 시간 저장 성공:', data);
        
    } catch (error) {
        console.error('퇴실체크 오류:', error);
        timeDisplay.innerHTML = `
            <div style="color: red;"><strong>❌ 퇴실체크 실패: ${error.message}</strong></div>
        `;
        alert('퇴실체크에 실패했습니다: ' + error.message);
    } finally {
        // 버튼 다시 활성화
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = '퇴실체크';
    }
});
