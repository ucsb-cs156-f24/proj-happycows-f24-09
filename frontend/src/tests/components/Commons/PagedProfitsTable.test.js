import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import PagedProfitsTable from "main/components/Commons/PagedProfitsTable";
import pagedProfitsFixtures from "fixtures/pagedProfitsFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("PagedProfitsTable tests", () => {

  const queryClient = new QueryClient();

  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "PagedProfitsTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });


  test("renders correct content", async () => {

    // arrange
    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, pagedProfitsFixtures.onePage);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>

    );

    // assert
    const expectedHeaders = ['Profit', 'Date', 'Health', 'Cows'];
    const expectedFields = ['amount', 'timestamp', 'avgCowHealth', 'numCows'];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/commonsid");
    expect(axiosMock.history.get[0].params).toEqual({commonsId: undefined, pageNumber: 0, pageSize: 5 });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-amount`)).toHaveTextContent(
      "110");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-timestamp`)
    ).toHaveTextContent("2024-06-16");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-avgCowHealth`)
    ).toHaveTextContent("100.00%");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-numCows`)
    ).toHaveTextContent("5");


    expect(screen.getByTestId(`${testId}-header-timestamp-sort-carets`)).toHaveTextContent("🔽");


    const nextButton = screen.getByTestId(`${testId}-next-button`);
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    const previousButton = screen.getByTestId(`${testId}-previous-button`);
    expect(previousButton).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
  });

   test("buttons are disabled where there are zero pages", async () => {

    // arrange

    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, pagedProfitsFixtures.emptyPage);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>

    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/commonsid");
    expect(axiosMock.history.get[0].params).toEqual({ commonsId:undefined, pageNumber: 0, pageSize: 5 });

    const nextButton = screen.getByTestId(`${testId}-next-button`);
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    const previousButton = screen.getByTestId(`${testId}-previous-button`);
    expect(previousButton).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
  }); 





  test("renders correct content with multiple pages", async () => {
    // arrange

    axiosMock.onGet("/api/profits/paged/commonsid"   ,{ params: {commonsId: undefined, pageNumber: 0, pageSize: 5 } }   ).reply(200, pagedProfitsFixtures.twoPages[0]);
    axiosMock.onGet("/api/profits/paged/commonsid" ,{ params: {commonsId: undefined, pageNumber: 1, pageSize: 5 } }     ).reply(200, pagedProfitsFixtures.twoPages[1]);


    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>

    );

    // assert
    const expectedHeaders = ['Profit', 'Date', 'Health', 'Cows'];
    const expectedFields = ['amount', 'timestamp', 'avgCowHealth', 'numCows'];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });



    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(axiosMock.history.get[0].url).toBe("/api/profits/paged/commonsid");
    expect(axiosMock.history.get[0].params).toEqual({ commonsId: undefined, pageNumber: 0, pageSize: 5 });



    const nextButton = screen.getByTestId(`${testId}-next-button`);
    expect(nextButton).toBeInTheDocument();

    const previousButton = screen.getByTestId(`${testId}-previous-button`);
    expect(previousButton).toBeInTheDocument();

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    expect(screen.getByText(`Page: 1`)).toBeInTheDocument();

    expect(
        screen.getByTestId(`${testId}-cell-row-0-col-amount`)
      ).toHaveTextContent("20");

    fireEvent.click(nextButton);


    await waitFor(() => {expect(screen.getByText(`Page: 2`)).toBeInTheDocument();});
    expect(previousButton).toBeEnabled();
    expect(nextButton).toBeDisabled();


    fireEvent.click(previousButton);
    await waitFor(() => { expect(screen.getByText(`Page: 1`)).toBeInTheDocument();});
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled(); 

     expect(
        screen.getByTestId(`${testId}-cell-row-0-col-amount`)
      ).toHaveTextContent("20"); 



  });
  // Add these new tests at the end, just before the final closing bracket

  test("cells have correct right alignment styling", async () => {
    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, pagedProfitsFixtures.onePage);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    // Check profit cell formatting and alignment
    const profitCell = screen.getByTestId(`${testId}-cell-row-0-col-amount`);
    expect(profitCell).toHaveTextContent("$110.00");
    const profitStyle = window.getComputedStyle(profitCell);
    expect(profitStyle.textAlign).toBe("right");

    // Check health cell formatting and alignment
    const healthCell = screen.getByTestId(`${testId}-cell-row-0-col-avgCowHealth`);
    expect(healthCell).toHaveTextContent("100.00%");
    const healthStyle = window.getComputedStyle(healthCell);
    expect(healthStyle.textAlign).toBe("right");

    // Check cows cell alignment
    const cowsCell = screen.getByTestId(`${testId}-cell-row-0-col-numCows`);
    expect(cowsCell).toHaveTextContent("5");
    const cowsStyle = window.getComputedStyle(cowsCell);
    expect(cowsStyle.textAlign).toBe("right");
  });

  test("profit cells maintain formatting with different values", async () => {
    const modifiedData = {
      ...pagedProfitsFixtures.onePage,
      content: [{
        ...pagedProfitsFixtures.onePage.content[0],
        amount: 1234.5678,
        avgCowHealth: 75.5555
      }]
    };

    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, modifiedData);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    const profitCell = screen.getByTestId(`${testId}-cell-row-0-col-amount`);
    expect(profitCell).toHaveTextContent("$1,234.57");
    
    const healthCell = screen.getByTestId(`${testId}-cell-row-0-col-avgCowHealth`);
    expect(healthCell).toHaveTextContent("75.56%");
  });

  test("cells maintain alignment with empty or zero values", async () => {
    const modifiedData = {
      ...pagedProfitsFixtures.onePage,
      content: [{
        ...pagedProfitsFixtures.onePage.content[0],
        amount: 0,
        avgCowHealth: 0,
        numCows: 0
      }]
    };

    axiosMock.onGet("/api/profits/paged/commonsid").reply(200, modifiedData);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PagedProfitsTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });

    const profitCell = screen.getByTestId(`${testId}-cell-row-0-col-amount`);
    expect(profitCell).toHaveTextContent("$0.00");
    expect(window.getComputedStyle(profitCell).textAlign).toBe("right");

    const healthCell = screen.getByTestId(`${testId}-cell-row-0-col-avgCowHealth`);
    expect(healthCell).toHaveTextContent("0.00%");
    expect(window.getComputedStyle(healthCell).textAlign).toBe("right");

    const cowsCell = screen.getByTestId(`${testId}-cell-row-0-col-numCows`);
    expect(cowsCell).toHaveTextContent("0");
    expect(window.getComputedStyle(cowsCell).textAlign).toBe("right");
  });
});

