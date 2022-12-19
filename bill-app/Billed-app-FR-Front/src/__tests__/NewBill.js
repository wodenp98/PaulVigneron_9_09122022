/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";
jest.mock("../app/Store", () => mockStore);

import router from "../app/Router.js";

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
  });
  describe("When I am on NewBill Page", () => {
    test("Then the mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.className).toContain("active-icon");
    });

    test("Then the form should be displayed", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByTestId("form-new-bill")).toBeDefined();
    });
  });

  describe("When I am on NewBill Page and I upload a file", () => {
    test("Then the filame should be displayed in the receipt input", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const input = screen.getByTestId("file");
      const file = new File(["image.jpg"], "image.jpg", { type: "image/jpg" });

      input.addEventListener("change", handleChangeFile);
      userEvent.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0]).toEqual(file);
      expect(input.files[0].name).toBe("image.jpg");
    });
  });

  describe("When I am on NewBill Page and I upload a file with invalid format", () => {
    test("Then I should have an alert message ", () => {
      Object.defineProperty(window, "alert", { value: jest.fn() });

      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);

      const file = new File(["image.webp"], "image.webp", {
        type: "image/webp",
      });
      userEvent.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toBe("image.webp");
      expect(window.alert).toHaveBeenCalled();
    });
  });
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I am on New Bill page and I submit a completed form", () => {
    test("Then the new bill should be created", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const expenseType = screen.getByTestId("expense-type");
      const expenseName = screen.getByTestId("expense-name");
      const datePicker = screen.getByTestId("datepicker");
      const amount = screen.getByTestId("amount");
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      const comment = screen.getByTestId("commentary");
      const input = screen.getByTestId("file");

      const testNewBill = {
        type: "Transports",
        name: "test3",
        amount: "400",
        date: "2001-01-01",
        vat: "60",
        pct: "20",
        commentary: "en fait non",
        fileName: new File(["image.jpg"], "image.jpg", { type: "image/jpg" }),
      };

      fireEvent.change(expenseType, { target: { value: testNewBill.type } });
      fireEvent.change(expenseName, { target: { value: testNewBill.name } });
      fireEvent.change(amount, { target: { value: testNewBill.amount } });
      fireEvent.change(datePicker, { target: { value: testNewBill.date } });
      fireEvent.change(vat, { target: { value: testNewBill.vat } });
      fireEvent.change(pct, { target: { value: testNewBill.pct } });
      fireEvent.change(comment, { target: { value: testNewBill.commentary } });
      userEvent.upload(input, testNewBill.fileName);

      expect(expenseType.value).toBe(testNewBill.type);

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");

      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
