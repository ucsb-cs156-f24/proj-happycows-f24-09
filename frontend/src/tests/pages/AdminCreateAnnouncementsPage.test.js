import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "react-query";
import {MemoryRouter} from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import {apiCurrentUserFixtures} from "fixtures/currentUserFixtures";
import {systemInfoFixtures} from "fixtures/systemInfoFixtures";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
import { BrowserRouter as Router } from "react-router-dom";


import { toast } from "react-toastify";
import React from "react";


const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
    const originalModule = jest.requireActual("react-router-dom");
    return {
        __esModule: true,
        ...originalModule,
        Navigate: (x) => {
            mockedNavigate(x);
            return null;
        },
    };
});

jest.mock("react-toastify", () => ({
    toast: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        commonsId: "1",
    }),
}));

describe("AdminCreateAnnouncementsPage tests", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    const queryClient = new QueryClient();

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
        axiosMock.onGet("/api/commons/plus").reply(200, {
            commons: { name: "Test" },
        });
    });

    test("renders without crashing", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Create Announcement for Test")).toBeInTheDocument();
    });

    test("When you fill in form and click submit, the right things happens", async () => {
        jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({ commonsId: "13" });
        // console.log("Begin test");
        axiosMock.onPost("/api/announcements/post/13").reply(200, {
            "id": 13,
            "startDate": "2024-11-28",
            "endDate": "2024-11-29",
            "announcementText": "Test",
        });
        console.log("before render");
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminCreateAnnouncementsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        console.log("after render");

        expect(await screen.findByText("Create Announcement for Test")).toBeInTheDocument();

        const startDateField = screen.getByLabelText("Start Date");
        const endDateField = screen.getByLabelText("End Date");
        const messageField = screen.getByLabelText("Announcement");
        const submitButton = screen.getByTestId("AnnouncementForm-submit");

        fireEvent.change(startDateField, { target: { value: "2024-11-28T00:00" } });
        fireEvent.change(endDateField, { target: { value: "2024-11-29T00:00" } });
        fireEvent.change(messageField, { target: { value: "Test" } });

        // Verify field values
        expect(startDateField.value).toBe("2024-11-28T00:00");
        expect(endDateField.value).toBe("2024-11-29T00:00");
        expect(messageField.value).toBe("Test");

        fireEvent.click(submitButton);
       // Debugging: Check if the mutation is triggered
        console.log("Mutation triggered? axiosMock.history.post:", axiosMock.history.post);

        // Use waitFor to wait for the axios mock to capture the request
        await waitFor(() => {
            console.log("Waiting for POST request...");
            expect(axiosMock.history.post.length).toBe(1);
        });

        // Debugging: Check the content of the POST request
        console.log("axiosMock.history.post:", axiosMock.history.post);

        // The Date object is initialized from the form without time information. I believe React
        // Query calls toISOString() before stuffing it into the body of the POST request, so the
        // POST contains the suffix .000Z, which Java's LocalDateTime.parse ignores. [1]

        const expectedAnnouncement = {
            startDate: "2024-11-28",
            endDate: "2024-11-29",
            announcementText: "Test",
        };

        expect(axiosMock.history.post[0].params).toEqual({
            announcementText: "Test",
            startDate: "2024-11-28T00:00",
            endDate: "2024-11-29T00:00",
        });

        expect(toast).toBeCalledWith(<div>Announcement successfully created!
            <br />id: 13
            <br />startDate: 2024-11-28
            <br />endDate: 2024-11-29
            <br />announcementText: Test
        </div>);

        expect(mockedNavigate).toBeCalledWith({"to": "/"});
    });
    
});