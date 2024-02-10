/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
    _id,
    title:existingTitle,
    price:existingPrice,
    images:existingImages,
    category:assignedCategory,
    properties:assignedProperties,
}) {
    const [title,setTitle] = useState(existingTitle || '');
    const [category,setCategory] = useState(assignedCategory || '');
    const [productProperties, setProductProperties] = useState(assignedProperties || {});
    const [price,setPrice] = useState(existingPrice || '');
    const [images,setImages] = useState(existingImages || []);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories,setCategories] = useState(false);
    const router = useRouter();
    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        });
    }, []);

    async function saveProduct(ev) {
        const data = {
            title,
            price,
            images,
            category,
            properties:productProperties,
        };
        ev.preventDefault();
        if(_id) {
            // update (put)
            await axios.put('/api/products', {...data,_id});
        } else {
            // create (post)
            await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }

    if (goToProducts) {
        router.push('/products');
    }

    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            const res = await axios.post('/api/upload', data)
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }

    function updateImagesOrder(images) {
        setImages(images);
    }

    function setProductProp(propName, value) {
        setProductProperties(prev => {
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps;
        })
    }

    const propertiesToFill = [];
    // if there is a category for the prodect, then populate the properties of the category
    if (categories.length > 0 && category) {
        let catInfo = categories.find(({_id}) => _id === category);
        propertiesToFill.push(...catInfo.properties);
        // if there is a parent category, populate the properties of the parentCat
        while(catInfo?.parent?.id) {
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?.id);
            propertiesToFill.push(...parentCat.properties);
            // Loop back and check for grandparentCategory
            catInfo = parentCat;
        }
    }

    return (
        <form onSubmit={saveProduct}>
            <label>Product name</label>
            <input
                type="text"
                placeholder="Product name"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
            />
            
            <label>
                Category
            </label>
            <select 
                value={category}
                onChange={ev => setCategory(ev.target.value)}
            >
                <option value="">Uncategorized</option>
                {categories.length > 0 && categories.map(c => (
                    <option value={c._id}>{c.name}</option>
                ))}
            </select>

            {propertiesToFill.length > 0 && propertiesToFill.map(p => (
                <div className="">
                    <label>{p.name[0].toUpperCase()+p.name.substring(1)}</label>
                    <div>
                        <select 
                            value={productProperties[p.name]}
                            onChange={ev => 
                                setProductProp(p.name,ev.target.value)
                            }
                        >
                            {p.values.map(v => (
                                <option value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                    
                </div>
            ))}

            <label>
                Photos
            </label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable 
                    list={images}
                    className="flex flex-wrap gap-2"
                    setList={updateImagesOrder}>
                    {!!images?.length && images.map(link => (
                        <div key={link} className="h-24 rounded-sm shadow-sm border border-gray-200">
                            <img src={link} alt='' className="rounded-lg"/>
                        </div>
                    ))}
                </ReactSortable>

                {isUploading && (
                    <div className="h-24 flex items-center">
                        <Spinner />
                    </div>
                )}

                <label className="w-24 h-24 text-center
                cursor-pointer flex items-center justify-center 
                text-sm gap-1 rounded-xl bg-white shadow-sm border border-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>
                       Upload
                    </div>
                    <input type="file" onChange={uploadImages}
                        className="hidden"/>
                </label>
            </div>
            
            <label>Price (in USD)</label>
            <input
                type="text"
                placeholder="Price (xx.xx)"
                value={price}
                onChange={ev => setPrice(ev.target.value)}
            />
        
            <button type="submit" className="btn-primary mt-2">Save</button>
        </form>
    );
};