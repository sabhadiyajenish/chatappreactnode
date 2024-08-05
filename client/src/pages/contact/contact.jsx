import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
const Contact = () => {
  const [product, setProduct] = useState([]);
  const [allProduct, setAllProduct] = useState([]);

  const [page, setPage] = useState(1);
  const FetchData = async () => {
    fetch(`https://fakestoreapi.com/products?limit=${page * 5}`)
      .then((res) => res.json())
      .then((json) => {
        setProduct(json);
        setAllProduct(json);
      });
  };
  useEffect(() => {
    FetchData();
  }, [page]);
  return (
    <>
      <select
        name="brand"
        id="brand"
        onChange={(d) => {
          const data1 = allProduct?.filter(
            (dt) => dt?.category === d.target.value
          );
          console.log(product);
          if (d.target.value === "all") {
            setProduct(allProduct);
          } else {
            setProduct(data1);
          }
        }}
      >
        <option value="all">All</option>
        <option value="men's clothing">men's clothing</option>
        <option value="jewelery">jewelery</option>
        <option value="electronics">electronics</option>
        <option value="women's clothing">women's clothing</option>
      </select>
      <InfiniteScroll
        dataLength={product.length} //This is important field to render the next data
        next={() => {
          setTimeout(() => {
            setPage((prev) => prev + 1);
          }, 1500);
        }}
        hasMore={page > 4 - 1 ? false : true}
        loader={<h1 style={{ fontSize: "50px" }}>Loading...</h1>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <section className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">
          {product?.map((data, key) => {
            return (
              <>
                <div
                  key={key}
                  className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl"
                >
                  <img
                    src={data?.image}
                    alt="Product"
                    className="h-80 w-72 object-cover rounded-t-xl"
                  />
                  <div className="px-4 py-3 w-72">
                    <span className="text-gray-400 mr-3 uppercase text-xs">
                      {data?.category}
                    </span>
                    <p className="text-lg font-bold text-black truncate block capitalize">
                      {data?.title}
                    </p>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold text-black cursor-auto my-3">
                        ${data?.price}
                      </p>
                      <del>
                        <p className="text-sm text-gray-600 cursor-auto ml-2">
                          {" "}
                          ${Math.ceil(data?.price + 25)}
                        </p>
                      </del>
                    </div>
                  </div>
                </div>
              </>
            );
          })}
        </section>
      </InfiniteScroll>
    </>
  );
};

export default Contact;
