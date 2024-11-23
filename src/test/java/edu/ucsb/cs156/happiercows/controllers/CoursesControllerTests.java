package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.Courses;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.repositories.CoursesRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CoursesController.class)
@Import(TestConfig.class)
@AutoConfigureDataJpa
public class CoursesControllerTests extends ControllerTestCase {
    @MockBean
    CoursesRepository coursesRepository;

    @MockBean
    UserRepository userRepository;

    // Authorization tests for /api/courses/admin/all

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/courses/all"))
                .andExpect(status().is(403)); // logged out users can't get all
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all() throws Exception {
        mockMvc.perform(get("/api/courses/all"))
                .andExpect(status().is(200)); // logged
    }

    @Test
    public void logged_out_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/courses/post"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/courses/post"))
                .andExpect(status().is(403)); // only admins can post
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_user_can_get_all_courses() throws Exception {

        // arrange

        Courses course1 = Courses.builder()
                .name("CS16")
                .school("UCSB")
                .term("F23")
                .startDate(LocalDateTime.parse("2023-09-01T00:00:00"))
                .endDate(LocalDateTime.parse("2023-12-31T00:00:00"))
                .githubOrg("ucsb-cs16-f23")
                .build();

        Courses course2 = Courses.builder()
                .name("CS156")
                .school("UCSB")
                .term("W24")
                .startDate(LocalDateTime.parse("2024-01-08T00:00:00"))
                .endDate(LocalDateTime.parse("2024-03-22T00:00:00"))
                .githubOrg("ucsb-cs156-w24")
                .build();

        ArrayList<Courses> expectedCourses = new ArrayList<>();
        expectedCourses.addAll(Arrays.asList(course1, course2));

        when(coursesRepository.findAll()).thenReturn(expectedCourses);

        // act
        MvcResult response = mockMvc.perform(get("/api/courses/all"))
                .andExpect(status().isOk()).andReturn();

        // assert

        verify(coursesRepository, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedCourses);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void an_admin_user_can_post_a_new_course() throws Exception {
        // arrange

        Courses courseBefore = Courses.builder()
                .name("CS16")
                .school("UCSB")
                .term("F23")
                .startDate(LocalDateTime.parse("2023-09-01T00:00:00"))
                .endDate(LocalDateTime.parse("2023-12-31T00:00:00"))
                .githubOrg("ucsb-cs16-f23")
                .build();

        when(coursesRepository.save(eq(courseBefore)))
                .thenReturn(courseBefore);

        // act
        MvcResult response = mockMvc.perform(
                post("/api/courses/post?name=CS16&school=UCSB&term=F23&startDate=2023-09-01T00:00:00&endDate=2023-12-31T00:00:00&githubOrg=ucsb-cs16-f23")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(coursesRepository, times(1)).save(courseBefore);
        String expectedJson = mapper.writeValueAsString(courseBefore);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
    //delete
    @WithMockUser(roles = {"ADMIN", "USER"})
    @Test
    public void admin_can_delete_existing_courses() throws Exception {
        Courses course1 = Courses.builder()
                .name("CS16")
                .school("UCSB")
                .term("F23")
                .startDate(LocalDateTime.parse("2023-09-01T00:00:00"))
                .endDate(LocalDateTime.parse("2023-12-31T00:00:00"))
                .githubOrg("ucsb-cs16-f23")
                .build();
        
        
        when(coursesRepository.findById(eq(15L))).thenReturn(Optional.of(course1));


      // act
        MvcResult response = mockMvc.perform(
                        delete("/api/courses?id=15")
                                        .with(csrf()))
                        .andExpect(status().isOk()).andReturn();


        verify(coursesRepository, times(1)).findById(15L);
        verify(coursesRepository, times(1)).delete(any());

        Map<String, Object> json = responseToJson(response);
        assertEquals("Courses with id 15 deleted", json.get("message"));
    }
    @WithMockUser(roles = {"ADMIN", "USER"})   
    @Test
    public void admin_cannot_delete_non_existing_courses() throws Exception {
        when(coursesRepository.findById(eq(20L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(delete("/api/courses?id=20").with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        verify(coursesRepository, times(1)).findById(20L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("Courses with id 20 not found", json.get("message"));
    }

}