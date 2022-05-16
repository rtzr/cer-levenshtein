import { levenstein } from "./levenstein";

const cer = (a: string, b: string) => {
    const replaced_a = a.replace(/\s/g, ``).match(/./g) || [];
    const replaced_b = b.replace(/\s/g, ``).match(/./g) || [];

    const result = levenstein(replaced_a, replaced_b);
    return result;
};

const wer = (a: string, b: string) => {
    const replaced_a = a.split(/\s+/g); //.match(/./g)
    const replaced_b = b.split(/\s+/g); //.match(/./g)

    const result = levenstein(replaced_a, replaced_b);
    return result;
};

/**
     * 
     * sourceTokens
     * ['안', '녕', '하', '세', '요', '저', '는', '아', '서', '입', '니', '다', 'a', 's', 'd', 'f', 'a', 's', 'd', 'f', 'a']
     *
     * targetTokens 
     * ['안', '녕', '하', '세', '요', '저', '는', '아', '써', '입', '니', '다']
     * 
     * 
     * edit ops
     * 0:(0) []
1:(3) [9, 9, 'sub']
2:(3) [13, 12, 'del']
3:(3) [14, 12, 'del']
4:(3) [15, 12, 'del']
5:(3) [16, 12, 'del']
6:(3) [17, 12, 'del']
7:(3) [18, 12, 'del']
8:(3) [19, 12, 'del']
9:(3) [20, 12, 'del']
10:(3) [21, 12, 'del']
     */
const align_string = (ref: string, hyp: string, _editops: any[][], slice_view = 50) => {
    const ref_array = ref.replace(/\s/g, ``).match(/./g) || [];
    const hyp_array = hyp.replace(/\s/g, ``).match(/./g) || [];
    const ref_space_indices = Array.from(ref.replace(/\s+/g, " ").matchAll(/\s/g)).map(
        el => el.index
    );

    let ref_added = 0;
    let hyp_added = 0;
    const ref_added_index = [];
    const ref_sub_index = [];
    for (const op of _editops) {
        // [ref_idx, hyp_inx, op_type]
        //  🟩🟩🟨⬜

        switch (op[2]) {
            case "Ins":
                ref_added_index.push(op[0] + ref_added);
                ref_array.splice(op[0] + ref_added, 0, "🟩");
                ref_added += 1;
                break;
            case "Sub":
                ref_sub_index.push(op[0] - 1 + ref_added);
                break;
            case "Del":
                hyp_array.splice(op[1] + hyp_added, 0, "🟨");
                hyp_added += 1;
                break;
        }
    }

    for (let i = 0; i < ref_space_indices.length; i++) {
        ref_space_indices[i] += ref_added_index.filter(el => el < ref_space_indices[i] - i).length;
    }

    const BIG_SPACE = "\u3000";
    const new_sub_array = ref_array.map((el, idx) => {
        if (ref_sub_index.includes(idx)) {
            return "⬜";
        }
        return BIG_SPACE;
    }) as string[];
    for (let i = ref_space_indices.length - 1; i >= 0; i--) {
        ref_array.splice(ref_space_indices[i] - i, 0, BIG_SPACE);
        hyp_array.splice(ref_space_indices[i] - i, 0, BIG_SPACE);

        new_sub_array.splice(ref_space_indices[i] - i, 0, BIG_SPACE);
    }

    function get_n_sliced(arr: string[], size: number) {
        const sliced = [];
        const tmp_arr = Array.from(arr);
        while (tmp_arr.length > 0) sliced.push(tmp_arr.splice(0, size).join(""));
        return sliced;
    }
    // Ideographic Space U+3000
    const ref_sliced = get_n_sliced(ref_array, slice_view).map(el =>
        el.replaceAll(/([A-Z0-9])/gi, "$1 ")
    );
    const hyp_sliced = get_n_sliced(hyp_array, slice_view).map(el =>
        el.replaceAll(/([A-Z0-9])/gi, "$1 ")
    );
    const sub_sliced = get_n_sliced(new_sub_array, slice_view);

    return [ref_sliced, hyp_sliced, sub_sliced];
};

export const utils = {
    cer,
    wer,
    align_string,
};
