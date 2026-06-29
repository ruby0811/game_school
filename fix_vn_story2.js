const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Update _renderMessage to handle image URLs for backgrounds
const oldBgLogic = `this.bgEl.style.backgroundColor = msg.bg || '#ffe4e1';`;
const newBgLogic = `if (msg.bg && msg.bg.startsWith('url(')) {
                this.bgEl.style.backgroundImage = msg.bg;
                this.bgEl.style.backgroundSize = 'cover';
                this.bgEl.style.backgroundPosition = 'center';
                this.bgEl.style.backgroundColor = 'transparent';
            } else {
                this.bgEl.style.backgroundImage = 'none';
                this.bgEl.style.backgroundColor = msg.bg || '#ffe4e1';
            }`;
code = code.replace(oldBgLogic, newBgLogic);

const vnStart = code.indexOf('visualNovel: {');
const initStart = code.indexOf('        init() {', vnStart);

const newScriptData = `        cg: {
            protag: 'images/vn_char_protag.jpg',
            siwoo: 'images/vn_char_siwoo.png'
        },
        script: [
            // SCENE 0: 교실 (낮)
            { bg: 'url(images/bg_classroom.jpg)', char: '', name: '나 (독백)', text: '수업이 끝난 교실. 늘 그렇듯 시우와 나, 단둘이 남았다.' },
            { bg: 'url(images/bg_classroom.jpg)', char: '', name: '나 (독백)', text: '어릴 적부터 붙어 다닌 불알친구. 하지만 요즘 들어 이 녀석이 자꾸 신경 쓰인다.' },
            { bg: 'url(images/bg_classroom.jpg)', char: 'siwoo', name: '시우', text: '야, 멍 때리지 말고 수학 노트나 빌려줘. 나 필기 하나도 안 했단 말이야.' },
            { bg: 'url(images/bg_classroom.jpg)', char: 'protag', name: '나', text: '어휴, 넌 나 없으면 어쩌려고 그러냐?' },
            { bg: 'url(images/bg_classroom.jpg)', char: 'siwoo', name: '시우', text: '그러니까 평생 내 옆에 딱 붙어있어야지. 딴 놈한테 가지 말고.' },
            { bg: 'url(images/bg_classroom.jpg)', char: '', name: '나 (독백)', text: '심장이 쿵 내려앉았다. 쟤는 꼭 아무렇지 않게 저런 말을 한단 말이지.' },
            { bg: 'url(images/bg_classroom.jpg)', char: '', name: '나 (독백)', text: '어떻게 반응해야 할까?' },
            {
                bg: 'url(images/bg_classroom.jpg)', choices: [
                    { text: '뭐, 뭐래! 징그럽게...', next: 1, aff: 0 },
                    { text: '그래, 평생 내가 책임져줄게.', next: 1, aff: +20 }
                ]
            }
        ],
        dialogueScripts: {
            1: [
                // SCENE 1: 하굣길 거리 (노을)
                { bg: 'url(images/bg_street.jpg)', char: '', name: '나 (독백)', text: '하굣길. 해가 뉘엿뉘엿 지고 있다. 우리는 아이스크림을 하나씩 물고 길을 걷고 있다.' },
                { bg: 'url(images/bg_street.jpg)', char: 'siwoo', name: '시우', text: '아 맞다. 너 이번 주말에 약속 있어?' },
                { bg: 'url(images/bg_street.jpg)', char: 'protag', name: '나', text: '주말? 딱히 없는데. 왜?' },
                { bg: 'url(images/bg_street.jpg)', char: 'siwoo', name: '시우', text: '그럼 나랑 시내 새로 생긴 카페 가자. 거기 케이크가 그렇게 맛있다며.' },
                { bg: 'url(images/bg_street.jpg)', char: '', name: '나 (독백)', text: '시우가 내 입가에 묻은 아이스크림을 자연스럽게 손가락으로 닦아낸다.' },
                { bg: 'url(images/bg_street.jpg)', char: 'siwoo', name: '시우', text: '칠칠맞긴. 애기냐?' },
                { bg: 'url(images/bg_street.jpg)', char: '', name: '나 (독백)', text: '얼굴이 화끈거린다. 단둘이 주말에 카페라니... 이거 데이트 신청 아니야?' },
                {
                    bg: 'url(images/bg_street.jpg)', choices: [
                        { text: '어? 어, 그래... 같이 가자.', next: 2, aff: +10 },
                        { text: '케이크 쏘는 거지? 당근 가야지!', next: 2, aff: 0 }
                    ]
                }
            ],
            2: [
                // SCENE 2: 카페 (주말)
                { bg: 'url(images/bg_cafe.jpg)', char: '', name: '나 (독백)', text: '주말 오후, 카페 앞. 평소 교복 차림만 보다가 사복을 입은 시우를 보니 왠지 낯설고 설렌다.' },
                { bg: 'url(images/bg_cafe.jpg)', char: 'siwoo', name: '시우', text: '야! 늦어서 미안. 오래 기다렸어?' },
                { bg: 'url(images/bg_cafe.jpg)', char: 'protag', name: '나', text: '아니, 방금 왔어. 근데 너... 오늘 좀 멀끔하다?' },
                { bg: 'url(images/bg_cafe.jpg)', char: 'siwoo', name: '시우', text: '아 뭐래. 맨날 보던 얼굴인데. 가자, 내가 케이크 사줄게.' },
                { bg: 'url(images/bg_cafe.jpg)', char: '', name: '나 (독백)', text: '카페에 마주 앉아 조각 케이크를 먹는다. 시우가 나를 빤히 쳐다보고 있다.' },
                { bg: 'url(images/bg_cafe.jpg)', char: 'siwoo', name: '시우', text: '너 오늘... 좀 예쁘네.' },
                { bg: 'url(images/bg_cafe.jpg)', char: 'protag', name: '나', text: '쿨럭! (먹던 커피를 뿜을 뻔했다)' },
                { bg: 'url(images/bg_cafe.jpg)', char: 'siwoo', name: '시우', text: '왜 놀라고 그래. 예쁜 걸 예쁘다고 한 건데.' },
                {
                    bg: 'url(images/bg_cafe.jpg)', choices: [
                        { text: '너, 너 뭐 잘못 먹었어?', next: 3, aff: 0 },
                        { text: '(얼굴을 붉히며) ...고마워.', next: 3, aff: +20 }
                    ]
                }
            ],
            3: [
                // SCENE 3: 공원 (고백)
                { bg: 'url(images/bg_park.jpg)', char: '', name: '나 (독백)', text: '카페에서 나와 근처 공원을 걷는다. 벚꽃이 흩날리는 벤치에 나란히 앉았다.' },
                { bg: 'url(images/bg_park.jpg)', char: 'siwoo', name: '시우', text: '있잖아. 나 너한테 할 말 있어.' },
                { bg: 'url(images/bg_park.jpg)', char: 'protag', name: '나', text: '무슨 말인데?' },
                { bg: 'url(images/bg_park.jpg)', char: 'siwoo', name: '시우', text: '우리, 이제 소꿉친구 그만할까?' },
                { bg: 'url(images/bg_park.jpg)', char: '', name: '나 (독백)', text: '순간 숨이 멎는 줄 알았다. 시우의 눈빛이 장난기 하나 없이 진지하다.' },
                { bg: 'url(images/bg_park.jpg)', char: 'siwoo', name: '시우', text: '나, 너 좋아해. 아주 오래 전부터.' },
                { bg: 'url(images/bg_park.jpg)', char: '', name: '나 (독백)', text: '드디어 올 것이 왔다. 내 마음을 전할 차례다.' },
                {
                    bg: 'url(images/bg_park.jpg)', condition: (state) => state.aff >= 40,
                    choices: [
                        { text: '나도... 나도 너 좋아했어. 계속.', next: 4 },
                        { text: '장난치지 마. 우린 그냥 친구잖아.', next: 5 }
                    ]
                },
                {
                    bg: 'url(images/bg_park.jpg)', condition: (state) => state.aff < 40,
                    choices: [
                        { text: '나도... 나도 너 좋아했어. 계속.', next: 4 },
                        { text: '장난치지 마. 우린 그냥 친구잖아.', next: 5 }
                    ]
                }
            ],
            4: [
                // 엔딩 1 (연인)
                { bg: 'url(images/bg_park.jpg)', char: 'siwoo', name: '시우', text: '정말? 하아... 다행이다. 나 진짜 많이 떨었단 말이야.' },
                { bg: 'url(images/bg_park.jpg)', char: '', name: '시우', text: '이제 내 여자친구 맞지? 잘 부탁해. (손을 꽉 잡는다)' },
                { isEpilogue: true, cgColor: '#ffb6c1', epilogueImg: 'images/vn_ending1_cafe.jpg', text: '[엔딩 1: 그날부터 1일]\\n오랜 소꿉친구였던 우리는, 이제 가장 가까운 연인이 되었습니다.' },
                { isEpilogue: true, cgColor: '#ffb6c1', epilogueImg: 'images/vn_ending1_wedding.jpg', text: '[True Ending: 영원한 약속]\\n그리고 시간이 흘러, 두 사람은 많은 사람들의 축복 속에서 영원을 약속합니다.' }
            ],
            5: [
                // 엔딩 2 (절친)
                { bg: 'url(images/bg_park.jpg)', char: 'protag', name: '나', text: '무슨 소리야. 우린 평생 절친이잖아. 그런 농담 재미없어.' },
                { bg: 'url(images/bg_park.jpg)', char: 'siwoo', name: '시우', text: '...그래. 하하, 넌 진짜 눈치 없다. 장난친 건데.' },
                { bg: 'url(images/bg_park.jpg)', char: '', name: '나 (독백)', text: '씁쓸하게 웃는 시우의 표정을 애써 모른 척했다. 나는 이 관계가 깨지는 게 너무나 두려웠으니까.' },
                { isEpilogue: true, cgColor: '#e8f5e9', text: '[엔딩 2: 평생의 소꿉친구]\\n우리는 선을 넘지 않은 채, 영원히 곁을 지키는 가장 친한 친구로 남았습니다.' }
            ]
        }
    },
`;

const cgStart = code.indexOf('        cg: {', vnStart);
if (cgStart !== -1 && initStart !== -1) {
    code = code.substring(0, cgStart) + newScriptData + code.substring(initStart);
    fs.writeFileSync('minigames.js', code);
    console.log('Script updated safely');
}
