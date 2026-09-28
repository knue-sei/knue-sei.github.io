// 관리자 비밀번호 설정:  npm run set-password
const readline = require('readline');
const { setPassword } = require('../lib/auth');

const arg = process.argv[2];
if (arg) {
  if (arg.length < 8) { console.error('비밀번호는 8자 이상이어야 합니다.'); process.exit(1); }
  setPassword(arg);
  console.log('관리자 비밀번호가 설정되었습니다.');
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('새 관리자 비밀번호(8자 이상): ', (pw) => {
  rl.question('비밀번호 확인: ', (pw2) => {
    rl.close();
    if (pw !== pw2) { console.error('두 비밀번호가 다릅니다.'); process.exit(1); }
    if (!pw || pw.length < 8) { console.error('비밀번호는 8자 이상이어야 합니다.'); process.exit(1); }
    setPassword(pw);
    console.log('관리자 비밀번호가 설정되었습니다.');
  });
});
