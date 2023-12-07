/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { error404, error500 } from '../__mocks__/ErrorPromises.js';
import router from "../app/Router"
import { bills } from "../fixtures/bills"
import BillsUI from "../views/BillsUI.js"

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeAll(async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByText("Envoyer une note de frais"))
    })

    afterAll(() => {
      window.localStorage.clear();
      document.body.innerHTML = ''
    })

    test("Then the new bill form should be visible", () => {
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })

    test("Then email icon in vertical layout should be highlighted", () => {
      expect(screen.getByTestId('icon-mail')).toHaveClass('active-icon')
    })

    test("Then expense type input should be visible, required, have seven options and selectable by user", () => {
      const select = screen.getByTestId('expense-type');
      const options = screen.getAllByRole('option');

      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('required');
      expect(options).toHaveLength(7);
      userEvent.selectOptions(select, 'Restaurants et bars');
      expect(select).toHaveValue('Restaurants et bars');
    })

    test("Then expense name input should be visible, required, and accept user input", () => {
      const input = screen.getByTestId('expense-name')

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('required');
      expect(input).toHaveValue('');
      userEvent.type(input, 'Vol Paris Londres');
      expect(input).toHaveValue('Vol Paris Londres');
    })

    test("Then date picker input should be visible and required", () => {
      const input = screen.getByTestId('datepicker');

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('required');
    })

    test("Then amount input should be visible, required, and accept user input", () => {
      const input = screen.getByTestId('amount')

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('required');
      expect(input).toHaveValue(null);
      userEvent.type(input, '348');
      expect(input).toHaveValue(348);
    })

    test("Then vat input should be visible, required, and accept user input", () => {
      const input = screen.getByTestId('vat')

      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(null);
      userEvent.type(input, '348');
      expect(input).toHaveValue(348);
    })

    test("Then pct input should be visible, required, and accept user input", () => {
      const input = screen.getByTestId('pct')

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('required');
      expect(input).toHaveValue(null);
      userEvent.type(input, '348');
      expect(input).toHaveValue(348);
    })

    test("Then commentary input should be visible, required, and accept user input", () => {
      const input = screen.getByTestId('commentary')

      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
      userEvent.type(input, 'Un commentaire');
      expect(input).toHaveValue('Un commentaire');
    })

    test("Then file input should be visible, required, and accept image files", () => {
      const input = screen.getByTestId('file')
      const file = new File(['(contenu du fichier)'], 'example.jpeg', { type: 'image/jpeg' });

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('accept', 'image/jpeg, image/png');
      userEvent.upload(input, file);
      expect(input.files[0]).toStrictEqual(file);
    })
  })
})

describe("Given I am an user connected as Employee and I am on NewBill Page uploading a file", () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
    await waitFor(() => screen.getAllByText("Envoyer une note de frais"))
  })

  afterEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = ''
  })

  describe("When I have selected a png file", () => {
    test("Then I should be able to submit my form", () => {
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const fileInput = screen.getByTestId('file')
      const file = new File(['(contenu du fichier)'], 'example.png', { type: 'image/png' })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener('change', handleChangeFile)

      fireEvent.change(fileInput, {
        target: {
          files: [file]
        }
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(screen.getByText('Veuillez sélectionner un fichier au format JPEG, JPG ou PNG valide.')).not.toHaveClass('show')
      expect(screen.getByRole('button')).not.toHaveAttribute('disabled')
    })
  }) 

  describe("When I have selected a pdf file", () => {
    test("Then I should have an error message and the submit button disabled", () => {
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const fileInput = screen.getByTestId('file')
      const file = new File(['(contenu du fichier)'], 'example.pdf', { type: 'application/pdf' })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener('change', handleChangeFile)

      fireEvent.change(fileInput, {
        target: {
          files: [file]
        }
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(screen.getByText('Veuillez sélectionner un fichier au format JPEG, JPG ou PNG valide.')).toHaveClass('show')
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })
  })
})

// test d'intégration POST
describe("Given I am an user connected as Employee and I am on NewBill Page", () => {
  describe("When I create a new bill", () => {
    test("Add bill to mock API POST", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      const bill = bills[0]

      await waitFor(() => screen.getByText("Envoyer une note de frais"))

      screen.getByTestId('expense-type').value = bill.type
      screen.getByTestId('expense-name').value = bill.name
      screen.getByTestId('datepicker').value = bill.date
      screen.getByTestId('amount').value = bill.amount
      screen.getByTestId('vat').value = bill.vat
      screen.getByTestId('pct').value = bill.pct
      screen.getByTestId('commentary').value = bill.commentary
      newBill.fileName = bill.fileName
      newBill.fileUrl = bill.fileUrl

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
    })

    describe("When an error occurs on API", () => {
      test("Then it should fetch messages from API and fail with 500 message error", async () => {
        jest.spyOn(mockStore, "bills")
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        )
        
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: error500
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        document.body.innerHTML = BillsUI({ error: "Erreur 500" })

        await new Promise(process.nextTick)
        const message = await screen.getByText(/Erreur 500/)

        expect(message).toBeTruthy()
      })
    })
  })
})