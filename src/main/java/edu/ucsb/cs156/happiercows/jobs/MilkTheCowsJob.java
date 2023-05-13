package edu.ucsb.cs156.happiercows.jobs;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.services.jobs.JobContext;
import edu.ucsb.cs156.happiercows.services.jobs.JobContextConsumer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
public class MilkTheCowsJob implements JobContextConsumer {

    @Getter
    private CommonsRepository commonsRepository;
    @Getter
    private UserCommonsRepository userCommonsRepository;
    @Getter
    private UserRepository userRepository;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Starting to milk the cows");

        Iterable<Commons> allCommons = commonsRepository.findAll();

        for (Commons commons : allCommons) {
            ctx.log("Milking cows for Commons: " + commons.getName());

            Iterable<UserCommons> allUserCommons = userCommonsRepository.findByCommonsId(commons.getId());

            for (UserCommons userCommons : allUserCommons) {
                User user = userRepository.findById(userCommons.getUserId()).orElseThrow(()->new RuntimeException("Error calling userRepository.findById(" + userCommons.getUserId() + ")"));
                ctx.log("User: " + user.getFullName() + ", numCows: " + userCommons.getNumOfCows() + ", cowHealth: " + userCommons.getCowHealth());

                ctx.log("Logic to milk the cows for user: " + user.getFullName() + " will go here");

                // TODO: Milk the cows, and report profits.
            }
        }

        ctx.log("Cows have been milked!");
    }
}
