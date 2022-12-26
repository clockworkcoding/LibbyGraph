# LibbyGraph
Transforms the exported activity history from the Libby app to a format matching the Goodreads export that StoryGraph can import.

Users can modify select fields and remove titles from the list. 

LibbyGraph assumes that titles whose last activity is a borrow are in "currently-reading" status, returned titles are "read" with a "read date" of the return date, and all others are "to-read"
