# Meme feed code review

## Performance

### Issue

> tl;dr:
>
> - Requiring non initially displayed data
> - Waterfalling queries

The main issue resulting in a bad performance is that we required loading data for elements that are not initially displayed on the screen (i.e. subsequents pages of memes/comments, comments and comments authors).  
On top of that, network queries are waterfalled which is drastically increasing the time before the app receives all its data.

### Solution

1. **Lazy load any data not needed for initial display**  
   We won't load comments and their authors until the user has clicked to read the comment section of a meme.  
   We will create an infinite loading feed for the memes and add a button to load next page of comments if the user wants to see more.
2. **Loading data in parallel**
   Instead of trying to fetch meme author or comment author at the same time than their parent, we will fetch them at in parallel for each entity while displaying the lists.
