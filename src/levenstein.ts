const Op = {
    Ins: 1,
    Del: 2,
    Sub: 3,
} as const;

const OpNames = Object.fromEntries(Object.entries(Op).map((str, _) => [str[1], str[0]]));

export const levenstein = (sourceTokens: string[], targetTokens: string[]) => {
    if (sourceTokens.length === 0 || targetTokens.length === 0) {
        const dist = Math.max(sourceTokens.length, targetTokens.length);
        return { distance: dist, editops: [], ratio: dist / targetTokens.length };
    }

    // add blank for computation
    sourceTokens.unshift("");
    targetTokens.unshift("");

    const [m, n] = [sourceTokens.length, targetTokens.length];
    const d: number[][] = Array(m + 1)
        .fill(undefined)
        .map(() => Array(n + 1).fill(0));

    // for avoiding memory copy of previous history, use any[][] for history
    const history: any[][] = new Array(m + 1).fill(undefined).map(() =>
        Array(n + 1)
            .fill(undefined)
            .map(_ => [undefined])
    );
    for (let i = 1; i <= m; i++) {
        d[i][0] = i;
        history[i][0] = new Array(i).fill(i).map((elem, idx) => [elem, idx, "ins"]);
    }

    for (let j = 1; j <= n; j++) {
        d[0][j] = j;
        history[0][j] = new Array(j).fill(j).map((elem, idx) => [idx, elem, "ins"]);
    }

    for (let j = 1; j <= n; j++) {
        for (let i = 1; i <= m; i++) {
            const substitutionCost = sourceTokens[i] === targetTokens[j] ? 0 : 1;
            const values = [
                { v: d[i][j - 1] + 1, op: Op.Ins, his: history[i][j - 1] },
                { v: d[i - 1][j] + 1, op: Op.Del, his: history[i - 1][j] },
                { v: d[i - 1][j - 1] + substitutionCost, op: Op.Sub, his: history[i - 1][j - 1] },
            ].sort((v1, v2) =>
                v1.v > v2.v ||
                /**
                 * insertion > deletion > substitution
                 */
                (v1.v === v2.v && (v1.op === Op.Ins || (v1.op === Op.Del && v2.op != Op.Del)))
                    ? 1
                    : -1
            );

            d[i][j] = values[0].v;
            history[i][j] = [values[0].his];
            if (values[0].op !== Op.Sub || substitutionCost == 1) {
                history[i][j].push([i, j, values[0].op]);
            }
        }
    }

    // unwrap result from history
    let result: any[][] = history[m][n];
    while (result[0] && typeof result[0][0] !== "number") {
        try {
            const remainders = result.splice(1);
            result = result[0].concat(remainders);
            if (result.length == 87) {
                console.error("result.length == 87");
            }
        } catch (e) {
            console.error(e);
        }
    }

    const final_ops = result.splice(1).map(elem => [elem[0], elem[1], OpNames[elem[2]]]);

    return {
        distance: d[m][n],
        editops: final_ops,
        // (source.length - 1) for efficient computation
        ratio: (d[m][n] / (sourceTokens.length - 1)) * 100.0,
    };
};
