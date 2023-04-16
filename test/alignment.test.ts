import { utils } from "../src"


test('test WER', () => {
  const r = utils.wer("abc", "abd");
  expect(r.ratio).toBeCloseTo(100.0);
});

test('test CER length==0', () => {
  let r = utils.cer("", "abd");
  expect(r.ratio).toBeCloseTo(1/0);

  r = utils.cer("abc", "");
  expect(r.ratio).toBeCloseTo(100.0);
});


test('test CER', () => {
  const r = utils.cer("abc", "abd");
  expect(r.ratio).toBeCloseTo(33.333);
});

test('test align undefined', () => {
  const txt1 = "txt1"
  const txt2 = ""
  const r = utils.cer(txt1, txt2);
  const r2 = utils.cer(txt2, txt1);

  const aligned = utils.align_string(txt1, txt2, r.editops, 2000);
  const aligned2 = utils.align_string(txt2, txt1, r2.editops, 2000);
  expect(aligned[1]).toStrictEqual([]);
  expect(aligned2[2]).toStrictEqual([]);
});


test('test CER + alignment0', () => {
  const txt1 = "안녕하세요 저는 아써입니다"
  const txt2 = "테스트"
  const r = utils.cer(txt1, txt2);

  const aligned = utils.align_string(txt1, txt2, r.editops, 2000);
  expect(aligned[0][0]).toBe(txt1.replaceAll(" ", "　"))
  expect(aligned[1][0]).toBe("🟨🟨🟨🟨🟨　🟨🟨　🟨🟨테스트")
  expect(aligned[2][0]).toBe("　　　　　　　　　　　⬜⬜⬜")
});


test('test CER + alignment0-1', () => {
  const txt1 = "테스트"
  const txt2 = "안녕하세요 저는 아써입니다"
  const r = utils.cer(txt1, txt2);

  const aligned = utils.align_string(txt1, txt2, r.editops, 2000);
  expect(aligned[0][0]).toBe("🟩🟩🟩🟩🟩🟩🟩🟩🟩테스트")
  expect(aligned[1][0]).toBe("안녕하세요저는아써입니다")
  expect(aligned[2][0]).toBe("　　　　　　　　　⬜⬜⬜")
});



test('test CER + alignment1', () => {
  const txt1 = "안녕하세요 저는 아서입니다"
  const txt2 = "안녕세요 저는 써입다"
  const r = utils.cer(txt1, txt2);

  const aligned = utils.align_string(txt1, txt2, r.editops, 2000);
  expect(aligned[0][0]).toBe(txt1.replaceAll(" ", "　"))
  expect(aligned[1][0]).toBe("안녕🟨세요　저는　🟨써입🟨다")
  expect(aligned[2][0]).toBe("　　　　　　　　　　⬜　　　")
});

const sample = `
안녕하세요 저는 아서입니다
안녕하세요 저는 아서입니다
안녕하세요 저는 아서입니다
테스트
안녕하세요 저는 아써입니다
`
const sample_hyp = `
안녕하세요 저는 아써입니다
테스트
안녕하세요 저 써니다
안녕하세요 저는 아서입니다
안녕하세요 저는 아써입니다
`