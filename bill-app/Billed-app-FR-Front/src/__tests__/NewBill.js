/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from "@testing-library/dom";
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
      expect(windowIcon.className).toBe("active-icon");
    });

    test("Then the form should be displayed", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  describe("When I am on NewBill Page and i upload a file", () => {
    test("Then the filame should be displayed in the receipt input", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
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
});
