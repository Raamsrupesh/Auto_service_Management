export function avg(arr) {
    let tot_score = 0;
    arr.forEach(element => {
        tot_score += element;
    });

    return tot_score/arr.length;
}