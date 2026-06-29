const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Remove epilogueImg from ending 1 cafe scene
code = code.replace(
    `{ isEpilogue: true, cgColor: '#ffb6c1', epilogueImg: 'images/vn_ending1_cafe.jpg', text: '[엔딩 1: 그날부터 1일]\\n오랜 소꿉친구였던 우리는, 이제 가장 가까운 연인이 되었습니다.' }`,
    `{ isEpilogue: true, cgColor: '#ffb6c1', text: '[엔딩 1: 그날부터 1일]\\n오랜 소꿉친구였던 우리는, 이제 가장 가까운 연인이 되었습니다.' }`
);

// Remove epilogueImg from ending 1 wedding scene
code = code.replace(
    `{ isEpilogue: true, cgColor: '#ffb6c1', epilogueImg: 'images/vn_ending1_wedding.jpg', text: '[True Ending: 영원한 약속]\\n그리고 시간이 흘러, 두 사람은 많은 사람들의 축복 속에서 영원을 약속합니다.' }`,
    `{ isEpilogue: true, cgColor: '#ffb6c1', text: '[True Ending: 영원한 약속]\\n그리고 시간이 흘러, 두 사람은 많은 사람들의 축복 속에서 영원을 약속합니다.' }`
);

fs.writeFileSync('minigames.js', code);
console.log('Epilogue images removed from ending 1');
