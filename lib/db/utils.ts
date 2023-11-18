export const fetchAllSupabase = async <T>(dbCall: (page: number, limit: number) => Promise<T[]>): Promise<T[]> => {
    const limit = 500;
    let allData: T[] = [];
    let page = 0;
    let fetchMore = true;

    while (fetchMore) {
        // eslint-disable-next-line no-await-in-loop
        const data = await dbCall(page, limit).catch(e => console.error(e));
        if (data && data.length > 0) {
            allData = allData.concat(data);
            page++;
        } else {
            fetchMore = false;
        }
    }

    return allData;
}