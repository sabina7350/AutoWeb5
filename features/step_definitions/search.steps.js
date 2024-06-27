const puppeteer = require("puppeteer");
const chai = require("chai");
const expect = chai.expect;
const { Given, When, Then, Before, After } = require("cucumber");
const { clickElement, getText } = require("../../lib/commands.js");
const { getDate } = require("../../lib/util.js");

let browser;
let page;


Before(async function () {
  browser = await puppeteer.launch({
    slowMo: 10,
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  page = await browser.newPage();
  this.browser = browser;
  this.page = page;
});


After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});


Given("пользователь на странице {string}", async function (url) {
  try {
    await this.page.goto(url, { setTimeout: 60000 });
  } catch (error) {
    throw new Error(`Failed to navigate to ${url} with error: ${error}`);
  }
});


When("переходит на расписание следующего дня", async function () {
  return await clickElement(this.page, ".page-nav__day:nth-child(2)");
});


When("выбирает место в зале кинотеатра 3 ряд 6 место", async function () {
  await this.page.waitForSelector(".buying-scheme__wrapper");

  await clickElement(this.page, ".buying-scheme__wrapper > :nth-child(3) > :nth-child(6)");
  await clickElement(this.page, "button");
});


Then("получает результат выбранного места до покупки", async function () {
  await this.page.waitForSelector(".ticket__info-wrapper");

  let resultText = [];
  for (let i = 1; i < 6; i++) {
    try {
      let text = await getText(this.page, `.ticket__info-wrapper > p:nth-child(${i}) > span`);
      resultText.push(text);
    } catch (e) {
      console.error(`Error while getting text for paragraph ${i}`, e);
    }
  }
  const actual = resultText;
  const expected = await ["\"Сталкер(1979)\"", "3/6", "ЗалЗал90", getDate(1), "13:00"];
  expect(actual).to.have.members(expected);
});


When(
  "выбирает места в зале кинотеатра 6 ряд 4,5,6,7,8 места",
  async function () {
    await this.page.waitForSelector(".buying-scheme__wrapper");

    let place4 = ".buying-scheme__wrapper > :nth-child(6) > :nth-child(4)";
    let place5 = ".buying-scheme__wrapper > :nth-child(6) > :nth-child(5)";
    let place6 = ".buying-scheme__wrapper > :nth-child(6) > :nth-child(6)";
    let place7 = ".buying-scheme__wrapper > :nth-child(6) > :nth-child(7)";
    let place8 = ".buying-scheme__wrapper > :nth-child(6) > :nth-child(8)";

    await clickElement(this.page, place4);
    await clickElement(this.page, place5);
    await clickElement(this.page, place6);
    await clickElement(this.page, place7);
    await clickElement(this.page, place8);
    await clickElement(this.page, ".acceptin-button");
  }
);


Then("получает результат выбранных мест до покупки", async function () {
  await this.page.waitForSelector(".ticket__info-wrapper");

  let resultText = [];
  for (let i = 1; i < 6; i++) {
    try {
      let text = await getText(this.page, `.ticket__info:nth-child(${i}) > span`);
      resultText.push(text);
    } catch (e) {
      console.error(`Error while getting text for paragraph ${i}`, e);
    }
  }

  const actual = resultText;
    const expected = await [
      "\"Сталкер(1979)\"",
      "6/4, 6/5, 6/6, 6/7, 6/8",
      "ЗалЗал90",
      getDate(2),
      "13:00",
    ];
  expect(actual).to.have.members(expected);
});


When("переходит на расписание через 2 дня от текущей даты", async function () {
  return await clickElement(this.page, ".page-nav__day:nth-child(3)");
});


When("выбирает время сеанса фильма на 13-00", async function () {
    return await clickElement(this.page, ".movie-seances__hall a");
  }
);


When("переходит по расписанию показа фильмов", async function () {
  await clickElement(this.page, ".page-nav__day:nth-child(2)");
  return await clickElement(page, '.movie-seances__hall a');
});


Then(
  "пытается выбрать место, которое занято и получает результат",
  async function () {
    await this.page.waitForSelector(".buying-scheme__wrapper");
    await clickElement(page, ".buying-scheme__wrapper > :nth-child(3) > :nth-child(3)");

    const button = await page.$eval(".acceptin-button", (el) => el.disabled);
    expect(button).equal(true);
  }
);
