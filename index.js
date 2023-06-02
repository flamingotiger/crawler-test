const express = require('express');
const app = express();

// 기본 라우트
app.get('/', (req, res) => {
    function delay(timeout) {
        return new Promise((resolve) => {
            setTimeout(resolve, timeout);
        });
    }

    let itemLinks = [];
    async function scrapeData() {
        const browser = await puppeteer.launch({
            headless: false,
        });
        const page = await browser.newPage();

        await page.goto("https://www.carrefour.fr/marques/les-produits-carrefour"); // 크롤링할 사이트의 URL을 입력합니다.

        await page.waitForSelector("#onetrust-reject-all-handler");
        await page.click("#onetrust-reject-all-handler");

        const nextButtonClass =
            ".pagination__button-wrap .pl-button-deprecated--primary";
        // 로드 버튼 클릭 로직
        await page.waitForSelector(nextButtonClass); // 로드 버튼이 나타날 때까지 대기합니다.
        let i = 20;
        while (await page.$(nextButtonClass)) {
            // 로드 버튼이 존재하는 동안 반복합니다.
            await page.click(nextButtonClass); // 로드 버튼을 클릭합니다.
            await delay(3000);
            i += 20;
            if (i > 100) {
                break;
            }
        }
        await browser.close();
        itemLinks = await page.$$eval('a.product-card-image', (el) => {
            return el.map((e) => e.href);
        });
    }

    scrapeData();
    res.send({ items: itemLinks });
});

// 정적 파일 서비스
app.use(express.static('public'));

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 서버 시작
const port = 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});