import { createSlice } from "@reduxjs/toolkit";
const users = createSlice({
  name: "user",
  initialState: {
    covid: [],
    images: [],
    loading: false,
  },
  reducers: {
    //this is used for without calling apis directy send data into redux
    addUsers: (state, param) => {
      const { payload } = param;
      state.covid = [...state.covid, payload];
      console.log("city name>>", state.covid);
    },
    addImage: (state, action) => {
      state.images = [...state.images, {
        src: {
          Img: action.payload,
          name: "jenish",
          email: "jenish@gmail.com"
        }
      }];
    },
  }

});
const { actions, reducer } = users;
export const { addUsers, addImage } = actions;
export default reducer;
