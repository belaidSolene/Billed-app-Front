/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI, { rows } from "../views/BillsUI.js"
import { formatDate, convertDateWithAbbreviatedMonth } from "../app/format.js";
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills as mockedBills } from "../fixtures/bills"
import router from "../app/Router"

jest.mock("../app/Store", () => mockStore)


describe("Given I am connected as an Employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const sortedBills = mockedBills.sort((a, b) => (convertDateWithAbbreviatedMonth(formatDate(b.date)) - convertDateWithAbbreviatedMonth(formatDate(a.date))))

      document.body.innerHTML = BillsUI({ data: sortedBills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
 
      expect(dates).toEqual(datesSorted)
    })

    describe('When I click on the icon eye', () => {
      test('A modal should open', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: mockedBills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bills = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const eye = screen.getAllByTestId('icon-eye')[0]
        const handleClickIconEye = jest.fn(() => bills.handleClickIconEye(eye))
        $.fn.modal = jest.fn()
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()

        const modale = screen.getByTestId('modaleFileEmployee')
        expect(modale).toBeTruthy()
      })
    })

    describe('When I click on new bill button', () => {
      test('I should be sent on NewBill Page', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: mockedBills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bills = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const newBillButton = screen.getByTestId("btn-new-bill")
        const handleClickNewBill = jest.fn(() => bills.handleClickNewBill())
        newBillButton.addEventListener("click", handleClickNewBill)
        fireEvent.click(newBillButton)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy() 
      })
    })

    describe('When I am on Bills Page but it is loading', () => {
      test('Then, Loading Page should be rendered', () => {
        document.body.innerHTML = BillsUI({ loading: true })
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })

    describe('When I am on Bills Page but back-end send an error message', () => {
      test('Then, Error Page should be rendered', () => {
        document.body.innerHTML = BillsUI({ error: 'some error message' })
        expect(screen.getAllByText('Erreur')).toBeTruthy()
      })
    })

    describe('When I am on Bills and there are no bills', () => {
      test('Then, no rows should be shown', () => {
        document.body.innerHTML = rows([])
        const tbody = screen.queryByTestId('tbody')
        expect(tbody).toBeNull()
      })
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      
      await waitFor(() => screen.getByText("Mes notes de frais"))

      const tbody = screen.getByTestId("tbody")
      expect(tbody).toBeTruthy()
      expect(tbody.childElementCount).toEqual(4)

      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy()

      const newBillBtn = screen.getByTestId('btn-new-bill')
      expect(newBillBtn).toBeTruthy()

    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})

